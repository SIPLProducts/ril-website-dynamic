-- Move the existing document without changing its file, date or publication status.
UPDATE public.ir_documents
SET section_key = 'corporate-governance/policies'
WHERE section_key = 'corporate-governance/board-and-committees'
  AND title = 'Terms of Appointment of Independent Directors';