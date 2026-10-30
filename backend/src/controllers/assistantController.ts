import { Request, Response } from 'express';
import { localDb } from '../db/store.js';
import { ChatMessageSchema } from '../types/index.js';
import { chatWithAssistantGemini } from '../services/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

export async function listConversations(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const conversations = localDb.listConversations(userId);
    return res.json({ conversations });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to list conversations';
    return res.status(500).json({ error: errorMsg });
  }
}

export async function getConversationMessages(req: Request, res: Response): Promise<Response> {
  try {
    const conversationId = req.params.id;
    const messages = localDb.getMessages(conversationId);
    return res.json({ messages });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch messages';
    return res.status(500).json({ error: errorMsg });
  }
}

export async function sendMessage(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const { conversation_id, message } = ChatMessageSchema.parse(req.body);

    let profile = localDb.getProfile(userId);
    let preferences = localDb.getPreferences(userId);

    if (!profile) {
      profile = localDb.upsertProfile({
        id: userId,
        full_name: req.user!.full_name || 'Personalized User',
        onboarding_completed: true,
        personalization_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (!preferences) {
      preferences = localDb.upsertPreferences({
        id: uuidv4(),
        user_id: userId,
        interests: ['Technology', 'Programming'],
        categories: ['Technology', 'Education'],
        goals: ['Learn new skills'],
        disliked_categories: [],
        preferred_content_types: ['Courses'],
        budget_min: 0,
        budget_max: 5000,
        currency: 'INR',
        recommendation_frequency: 'daily',
        updated_at: new Date().toISOString(),
      });
    }

    // 1. Resolve or create conversation
    let convId = conversation_id;
    if (!convId) {
      const titleWords = message.slice(0, 35).trim();
      const newConv = localDb.createConversation({
        id: uuidv4(),
        user_id: userId,
        title: titleWords.length > 0 ? `${titleWords}...` : 'New Exploration',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      convId = newConv.id;
    }

    // 2. Save user message
    const now = new Date().toISOString();
    const userMsg = localDb.createMessage({
      id: uuidv4(),
      conversation_id: convId,
      user_id: userId,
      role: 'user',
      content: message,
      created_at: now,
    });

    // 3. Fetch past messages for context
    const priorMessages = localDb.getMessages(convId).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const feedback = localDb.getFeedbackForUser(userId);

    // 4. Generate AI response
    const assistantReply = await chatWithAssistantGemini(
      profile,
      preferences,
      feedback,
      priorMessages,
      message
    );

    // 5. Save assistant reply
    const assistantMsg = localDb.createMessage({
      id: uuidv4(),
      conversation_id: convId,
      user_id: userId,
      role: 'assistant',
      content: assistantReply,
      created_at: new Date().toISOString(),
    });

    // 6. Record user activity
    localDb.recordActivity({
      id: uuidv4(),
      user_id: userId,
      activity_type: 'assistant_query',
      metadata: { querySnippet: message.slice(0, 40) },
      created_at: new Date().toISOString(),
    });

    return res.json({
      conversation_id: convId,
      user_message: userMsg,
      assistant_message: assistantMsg,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to send message';
    console.error('sendMessage error:', error);
    return res.status(400).json({ error: errorMsg });
  }
}
