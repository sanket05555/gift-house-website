-- Migration to add a unique slug to products and safely backfill existing data

-- 1. Add column safely (nullable initially)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Backfill function
DO $$
DECLARE
    prod RECORD;
    base_slug TEXT;
    new_slug TEXT;
    counter INT;
BEGIN
    -- Target rows where slug is null or empty
    FOR prod IN SELECT id, title FROM public.products WHERE slug IS NULL OR trim(slug) = '' LOOP
        -- lowercase, remove non-alphanumeric (except space and hyphen)
        base_slug := lower(regexp_replace(prod.title, '[^a-zA-Z0-9\s-]', '', 'g'));
        -- replace spaces with hyphens
        base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
        -- collapse repeated hyphens
        base_slug := regexp_replace(base_slug, '-+', '-', 'g');
        -- remove leading/trailing hyphens
        base_slug := trim(both '-' from base_slug);
        
        -- Fallback if the title resulted in an empty string
        IF base_slug IS NULL OR base_slug = '' THEN
            base_slug := 'product-' || prod.id::text;
        END IF;

        new_slug := base_slug;
        counter := 2;
        
        -- Handle duplicates safely by auto-incrementing
        WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = new_slug AND id != prod.id) LOOP
            new_slug := base_slug || '-' || counter::text;
            counter := counter + 1;
        END LOOP;
        
        UPDATE public.products SET slug = new_slug WHERE id = prod.id;
    END LOOP;
END $$;

-- 3. Safely add constraint and NOT NULL
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'products_slug_key'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
    END IF;
END $$;
