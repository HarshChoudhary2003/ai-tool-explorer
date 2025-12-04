-- Add additional categories to tool_category enum
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'writing';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'research';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'customer_support';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'marketing';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'design';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'education';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'sales';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'hr_recruiting';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'legal';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE tool_category ADD VALUE IF NOT EXISTS 'healthcare';