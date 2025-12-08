-- 1. Create enum for tool categories
DROP TYPE IF EXISTS public.tool_category CASCADE;
CREATE TYPE public.tool_category AS ENUM (
  'llm',
  'image_generation',
  'voice',
  'automation',
  'no_code',
  'video',
  'audio',
  'productivity',
  'code_assistant',
  'data_analysis',
  'writing',
  'research',
  'customer_support',
  'marketing',
  'design',
  'education',
  'sales',
  'hr_recruiting',
  'legal',
  'finance',
  'healthcare'
);

-- 2. Create enum for pricing types
DROP TYPE IF EXISTS public.pricing_type CASCADE;
CREATE TYPE public.pricing_type AS ENUM (
  'free',
  'freemium',
  'paid',
  'enterprise'
);

-- 3. Create AI tools table
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category tool_category NOT NULL,
  description TEXT NOT NULL,
  tasks TEXT[] NOT NULL DEFAULT '{}',
  pricing pricing_type NOT NULL DEFAULT 'freemium',
  pricing_details TEXT,
  has_api BOOLEAN DEFAULT false,
  api_details TEXT,
  use_cases TEXT[] DEFAULT '{}',
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  website_url TEXT NOT NULL,
  logo_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create comparisons table
CREATE TABLE IF NOT EXISTS public.tool_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable RLS
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- ai_tools
DROP POLICY IF EXISTS "Anyone can view tools" ON public.ai_tools;
CREATE POLICY "Anyone can view tools" ON public.ai_tools FOR SELECT TO public USING (true);

-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- comparisons
DROP POLICY IF EXISTS "Users can view their own comparisons" ON public.tool_comparisons;
CREATE POLICY "Users can view their own comparisons" ON public.tool_comparisons FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create comparisons" ON public.tool_comparisons;
CREATE POLICY "Users can create comparisons" ON public.tool_comparisons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 8. Functions & Triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_ai_tools_updated_at ON public.ai_tools;
CREATE TRIGGER update_ai_tools_updated_at BEFORE UPDATE ON public.ai_tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Insert Data
INSERT INTO public.ai_tools (name, category, description, tasks, pricing, pricing_details, has_api, api_details, use_cases, pros, cons, website_url, rating, popularity_score) VALUES
('ChatGPT', 'llm', 'Advanced conversational AI by OpenAI with GPT-4 technology', ARRAY['text generation', 'conversation', 'code assistance', 'analysis'], 'freemium', 'Free tier with GPT-3.5, Plus $20/mo for GPT-4', true, 'Full REST API with per-token pricing', ARRAY['customer support', 'content creation', 'coding help'], ARRAY['highly capable', 'natural conversations', 'multimodal'], ARRAY['can hallucinate', 'rate limits'], 'https://chat.openai.com', 4.8, 9500),
('Claude', 'llm', 'Anthropic''s AI assistant focused on safety and helpfulness', ARRAY['analysis', 'writing', 'coding', 'research'], 'freemium', 'Free tier, Pro $20/mo', true, 'API with context windows up to 200K tokens', ARRAY['research', 'document analysis', 'coding'], ARRAY['large context window', 'nuanced reasoning', 'safe outputs'], ARRAY['slower than competitors', 'limited image generation'], 'https://claude.ai', 4.7, 8200),
('Gemini', 'llm', 'Google''s multimodal AI with deep search integration', ARRAY['search', 'analysis', 'code', 'multimodal understanding'], 'freemium', 'Free tier, Advanced $19.99/mo', true, 'Gemini API with competitive pricing', ARRAY['research', 'data analysis', 'creative work'], ARRAY['Google integration', 'fast responses', 'multimodal'], ARRAY['newer than competitors', 'occasional inaccuracies'], 'https://gemini.google.com', 4.6, 7800),
('Llama', 'llm', 'Meta''s open-source large language model', ARRAY['text generation', 'chat', 'code', 'translation'], 'free', 'Completely free and open source', true, 'Open source - run locally or via providers', ARRAY['custom deployments', 'research', 'privacy-focused apps'], ARRAY['open source', 'customizable', 'no API costs'], ARRAY['requires technical setup', 'weaker than GPT-4'], 'https://llama.meta.com', 4.4, 6500),
('Perplexity', 'llm', 'AI-powered search engine with cited sources', ARRAY['research', 'search', 'fact-checking', 'summaries'], 'freemium', 'Free tier, Pro $20/mo', true, 'API for search and Q&A', ARRAY['research', 'fact verification', 'academic work'], ARRAY['cites sources', 'accurate information', 'real-time search'], ARRAY['limited creative tasks', 'subscription required for best model'], 'https://perplexity.ai', 4.7, 7200),
('Midjourney', 'image_generation', 'Leading AI art generator with photorealistic results', ARRAY['art generation', 'design', 'concept art', 'photography'], 'paid', 'Basic $10/mo, Standard $30/mo, Pro $60/mo', false, 'Discord bot interface, no direct API', ARRAY['marketing visuals', 'art creation', 'design mockups'], ARRAY['highest quality', 'artistic control', 'community'], ARRAY['Discord-only', 'no free tier', 'no API'], 'https://midjourney.com', 4.9, 9000),
('DALL-E 3', 'image_generation', 'OpenAI''s image generator with precise prompt following', ARRAY['image generation', 'editing', 'variations', 'concept art'], 'paid', 'Via ChatGPT Plus or API pricing', true, 'OpenAI API integration', ARRAY['marketing', 'product visualization', 'creative projects'], ARRAY['follows prompts well', 'safe outputs', 'integrated with ChatGPT'], ARRAY['requires subscription', 'slower than competitors'], 'https://openai.com/dall-e-3', 4.6, 7500),
('Stable Diffusion', 'image_generation', 'Open-source image generation model', ARRAY['image generation', 'style transfer', 'inpainting', 'upscaling'], 'free', 'Free and open source, paid hosting options', true, 'Open source - multiple API providers', ARRAY['custom models', 'privacy', 'research'], ARRAY['open source', 'customizable', 'free'], ARRAY['requires technical knowledge', 'quality varies'], 'https://stability.ai', 4.5, 8500),
('Leonardo AI', 'image_generation', 'AI art platform with game assets focus', ARRAY['game assets', 'character design', '3D textures', 'concept art'], 'freemium', 'Free tier, paid plans from $12/mo', true, 'REST API available', ARRAY['game development', 'NFT creation', 'digital art'], ARRAY['game-focused', 'consistent styles', 'good free tier'], ARRAY['less realistic than Midjourney', 'learning curve'], 'https://leonardo.ai', 4.4, 6000),
('Firefly', 'image_generation', 'Adobe''s commercial-safe AI image generator', ARRAY['image generation', 'text effects', 'vector art', 'generative fill'], 'freemium', 'Free tier, Premium with Creative Cloud', true, 'Adobe API integration', ARRAY['commercial projects', 'design work', 'marketing'], ARRAY['commercial rights', 'Adobe integration', 'safe for business'], ARRAY['less creative than competitors', 'requires Adobe account'], 'https://firefly.adobe.com', 4.3, 5500),
('ElevenLabs', 'voice', 'Realistic AI voice generation and cloning', ARRAY['voice cloning', 'text-to-speech', 'dubbing', 'narration'], 'freemium', 'Free tier, paid from $5/mo', true, 'Voice API with many languages', ARRAY['audiobooks', 'content creation', 'accessibility'], ARRAY['extremely realistic', 'voice cloning', 'multilingual'], ARRAY['ethical concerns', 'usage limits'], 'https://elevenlabs.io', 4.8, 7800),
('Descript', 'audio', 'AI-powered audio and video editing', ARRAY['transcription', 'editing', 'overdub', 'studio sound'], 'freemium', 'Free tier, Creator $24/mo', false, 'Limited API for transcription', ARRAY['podcasting', 'video editing', 'content creation'], ARRAY['all-in-one tool', 'easy editing', 'overdub feature'], ARRAY['expensive for teams', 'learning curve'], 'https://descript.com', 4.6, 6200),
('Murf AI', 'voice', 'AI voiceover platform for professional content', ARRAY['voiceover', 'text-to-speech', 'voice changing', 'dubbing'], 'freemium', 'Free trial, paid from $19/mo', true, 'Voice API available', ARRAY['presentations', 'e-learning', 'YouTube'], ARRAY['natural voices', 'affordable', 'easy to use'], ARRAY['limited voice customization'], 'https://murf.ai', 4.4, 5000),
('Resemble AI', 'voice', 'Custom AI voice creation for brands', ARRAY['voice cloning', 'custom voices', 'real-time voice', 'dubbing'], 'paid', 'Custom pricing, starts at $0.006/sec', true, 'Full API for voice generation', ARRAY['call centers', 'gaming', 'virtual assistants'], ARRAY['custom voices', 'real-time', 'API-first'], ARRAY['expensive', 'requires setup'], 'https://resemble.ai', 4.5, 4500),
('Zapier', 'automation', 'Connect and automate apps without code', ARRAY['workflow automation', 'app integration', 'data sync', 'notifications'], 'freemium', 'Free tier, paid from $19.99/mo', true, 'Extensive API and webhooks', ARRAY['business automation', 'data workflows', 'notifications'], ARRAY['huge app library', 'easy to use', 'reliable'], ARRAY['expensive for many tasks', 'can be slow'], 'https://zapier.com', 4.7, 9200),
('Make', 'automation', 'Visual automation platform with advanced features', ARRAY['workflow automation', 'data transformation', 'API integration', 'scheduling'], 'freemium', 'Free tier, paid from $9/mo', true, 'Webhooks and HTTP modules', ARRAY['complex workflows', 'data processing', 'integrations'], ARRAY['powerful features', 'affordable', 'visual builder'], ARRAY['steeper learning curve'], 'https://make.com', 4.6, 6800),
('n8n', 'automation', 'Open-source workflow automation tool', ARRAY['workflow automation', 'API integration', 'data processing', 'scheduling'], 'free', 'Free self-hosted, cloud from $20/mo', true, 'Full API and webhooks', ARRAY['self-hosted automation', 'custom integrations', 'data pipelines'], ARRAY['open source', 'self-hostable', 'flexible'], ARRAY['requires technical knowledge', 'maintenance needed'], 'https://n8n.io', 4.5, 5500),
('Bubble', 'no_code', 'Visual programming platform for web apps', ARRAY['web app development', 'database', 'workflows', 'responsive design'], 'freemium', 'Free tier, paid from $25/mo', true, 'API and plugin system', ARRAY['startups', 'MVPs', 'internal tools'], ARRAY['powerful features', 'full applications', 'no code needed'], ARRAY['performance limitations', 'learning curve'], 'https://bubble.io', 4.4, 7500),
('Webflow', 'no_code', 'Visual web design and CMS platform', ARRAY['web design', 'CMS', 'hosting', 'e-commerce'], 'freemium', 'Free tier, paid from $14/mo', true, 'CMS and e-commerce APIs', ARRAY['marketing sites', 'portfolios', 'e-commerce'], ARRAY['pixel-perfect design', 'great CMS', 'fast sites'], ARRAY['expensive for large sites', 'complex at first'], 'https://webflow.com', 4.7, 8500),
('GitHub Copilot', 'code_assistant', 'AI pair programmer powered by OpenAI Codex', ARRAY['code completion', 'code generation', 'documentation', 'testing'], 'paid', '$10/mo individual, $19/mo business', true, 'IDE extensions', ARRAY['software development', 'learning to code', 'productivity'], ARRAY['excellent suggestions', 'IDE integration', 'learns your style'], ARRAY['requires subscription', 'occasional wrong code'], 'https://github.com/features/copilot', 4.7, 9500),
('Cursor', 'code_assistant', 'AI-first code editor built on VS Code', ARRAY['code generation', 'refactoring', 'debugging', 'chat with code'], 'freemium', 'Free tier, Pro $20/mo', false, 'Editor interface, no separate API', ARRAY['rapid development', 'code understanding', 'refactoring'], ARRAY['integrated AI', 'fast', 'natural interaction'], ARRAY['beta features', 'requires learning new editor'], 'https://cursor.sh', 4.8, 7000),
('Tabnine', 'code_assistant', 'AI code completion for developers', ARRAY['code completion', 'whole-line suggestions', 'team models', 'private deployment'], 'freemium', 'Free tier, Pro $12/mo', true, 'IDE plugins', ARRAY['development', 'team coding', 'enterprise'], ARRAY['privacy-focused', 'team models', 'affordable'], ARRAY['less advanced than Copilot'], 'https://tabnine.com', 4.4, 6000),
('Codeium', 'code_assistant', 'Free AI code completion tool', ARRAY['code completion', 'chat', 'search', 'command generation'], 'free', 'Free for individuals, Enterprise pricing', true, 'IDE extensions', ARRAY['development', 'learning', 'productivity'], ARRAY['completely free', 'good performance', 'many IDEs'], ARRAY['smaller model', 'fewer features'], 'https://codeium.com', 4.5, 7500),
('Runway', 'video', 'AI-powered creative suite for video', ARRAY['video generation', 'motion tracking', 'green screen', 'style transfer'], 'freemium', 'Free tier, paid from $12/mo', true, 'Video API available', ARRAY['film production', 'content creation', 'social media'], ARRAY['cutting-edge features', 'easy to use', 'creative tools'], ARRAY['can be expensive', 'learning curve'], 'https://runwayml.com', 4.7, 6500),
('Synthesia', 'video', 'AI video generation with synthetic avatars', ARRAY['video generation', 'avatar creation', 'multilingual', 'presentation'], 'paid', 'Starts at $22/mo', true, 'Video generation API', ARRAY['training videos', 'marketing', 'presentations'], ARRAY['no filming needed', 'multilingual', 'professional'], ARRAY['uncanny valley', 'expensive'], 'https://synthesia.io', 4.5, 5500),
('HeyGen', 'video', 'AI video generator with talking avatars', ARRAY['avatar videos', 'video translation', 'voice cloning', 'lip sync'], 'freemium', 'Free trial, paid from $24/mo', true, 'API for video generation', ARRAY['marketing', 'e-learning', 'social media'], ARRAY['realistic avatars', 'easy to use', 'fast generation'], ARRAY['limited customization'], 'https://heygen.com', 4.6, 6000),
('Notion AI', 'productivity', 'AI writing assistant integrated in Notion', ARRAY['writing', 'summarization', 'translation', 'brainstorming'], 'paid', '$10/mo add-on to Notion', false, 'Notion API with AI capabilities', ARRAY['note-taking', 'documentation', 'project management'], ARRAY['Notion integration', 'contextual', 'collaborative'], ARRAY['requires Notion', 'limited to writing'], 'https://notion.so/product/ai', 4.5, 8000),
('Jasper', 'productivity', 'AI writing assistant for marketing', ARRAY['content writing', 'marketing copy', 'blog posts', 'ads'], 'paid', 'Starts at $39/mo', true, 'API for content generation', ARRAY['marketing', 'SEO', 'social media'], ARRAY['marketing-focused', 'templates', 'brand voice'], ARRAY['expensive', 'occasional generic output'], 'https://jasper.ai', 4.4, 6500),
('Copy.ai', 'productivity', 'AI content generator for teams', ARRAY['content writing', 'copywriting', 'workflows', 'brainstorming'], 'freemium', 'Free tier, paid from $36/mo', true, 'API available', ARRAY['sales copy', 'content marketing', 'social media'], ARRAY['good free tier', 'team features', 'templates'], ARRAY['can be repetitive'], 'https://copy.ai', 4.3, 5000),
('Julius AI', 'data_analysis', 'AI data analyst for everyone', ARRAY['data analysis', 'visualization', 'insights', 'SQL generation'], 'freemium', 'Free tier, paid from $20/mo', true, 'Data analysis API', ARRAY['business intelligence', 'reporting', 'data exploration'], ARRAY['natural language', 'visualizations', 'easy to use'], ARRAY['limited to data tasks'], 'https://julius.ai', 4.6, 4500),
('ChatPDF', 'productivity', 'Chat with your PDF documents', ARRAY['PDF analysis', 'document Q&A', 'summarization', 'citations'], 'freemium', 'Free tier, Plus $5/mo', true, 'Document API', ARRAY['research', 'studying', 'document review'], ARRAY['easy to use', 'accurate citations', 'affordable'], ARRAY['limited to PDFs', 'upload limits'], 'https://chatpdf.com', 4.4, 5500),
('Otter.ai', 'productivity', 'AI meeting transcription and notes', ARRAY['transcription', 'meeting notes', 'action items', 'collaboration'], 'freemium', 'Free tier, Pro $8.33/mo', true, 'Transcription API', ARRAY['meetings', 'interviews', 'lectures'], ARRAY['accurate transcription', 'meeting integration', 'affordable'], ARRAY['limited free tier'], 'https://otter.ai', 4.5, 7000),
('InVideo', 'video', 'AI video generator that creates professional videos from text prompts', ARRAY['text to video', 'video editing', 'script to video', 'content repurposing'], 'freemium', 'Free tier available, Business $15/mo', false, null, ARRAY['YouTube automation', 'marketing videos', 'social media content'], ARRAY['easy to use', 'huge stock library', 'human-sounding voiceovers'], ARRAY['watermark on free plan', 'rendering can be slow'], 'https://invideo.io', 4.7, 8800);
