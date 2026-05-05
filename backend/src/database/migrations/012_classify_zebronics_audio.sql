DO $$
BEGIN
  IF to_regclass('public.zebronics_products') IS NOT NULL THEN
    WITH product_text AS (
      SELECT
        id,
        LOWER(CONCAT_WS(' ', product_name, description, features::text, specifications::text)) AS text
      FROM zebronics_products
    )
    UPDATE zebronics_products zp
    SET category = CASE
      WHEN pt.text LIKE '%robot%' AND pt.text LIKE '%vacuum%' THEN 'robot_vacuums'
      WHEN zp.product_name ILIKE '%wired%' OR pt.text LIKE '%wired earphone%' OR pt.text LIKE '%wired earbud%' OR pt.text LIKE '%3.5 mm jack%' THEN 'wired_earphones'
      WHEN pt.text LIKE '%neckband%' OR pt.text LIKE '%neck band%' OR zp.product_name ILIKE '%yoga%' OR zp.product_name ILIKE '%raga%' OR zp.product_name ILIKE '%evolve%' OR zp.product_name ILIKE '%jumbo%' THEN 'neckbands'
      WHEN pt.text LIKE '%earbud%' OR pt.text LIKE '%ear bud%' OR pt.text LIKE '%buds%' OR pt.text LIKE '%pods%' OR pt.text LIKE '%tws%' OR pt.text LIKE '%sound bomb%' THEN 'earbuds'
      WHEN pt.text LIKE '%headphone%' OR pt.text LIKE '%headset%' OR zp.product_name ILIKE '%escape%' OR zp.product_name ILIKE '%storm%' OR zp.product_name ILIKE '%monk%' OR zp.product_name ILIKE '%glacier%' OR zp.product_name ILIKE '%meteoroid%' OR zp.product_name ILIKE '%mist%' OR zp.product_name ILIKE '%jiggle%' THEN 'headphones'
      ELSE zp.category
    END
    FROM product_text pt
    WHERE zp.id = pt.id
      AND zp.product_name IS NOT NULL;
  END IF;
END $$;
