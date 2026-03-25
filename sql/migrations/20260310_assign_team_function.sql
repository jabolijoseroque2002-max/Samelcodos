-- Function to assign a team to a report and update status
-- This function encapsulates the logic for team assignment

BEGIN;

-- Create the function
CREATE OR REPLACE FUNCTION public.assign_report_team(
  p_report_id bigint,
  p_team_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator privileges (bypass RLS)
SET search_path = public, extensions
AS $$
DECLARE
  v_team_exists boolean;
  v_current_status text;
  v_result jsonb;
BEGIN
  -- 1. Validate inputs
  IF p_report_id IS NULL THEN
    RAISE EXCEPTION 'Report ID is required';
  END IF;

  IF p_team_name IS NULL OR btrim(p_team_name) = '' THEN
    RAISE EXCEPTION 'Team name is required';
  END IF;

  -- 2. Check if team exists
  -- This check is important because we want to ensure we're assigning valid teams
  SELECT EXISTS (SELECT 1 FROM public.teams WHERE name = p_team_name) INTO v_team_exists;
  
  -- If team doesn't exist, we might want to auto-create it or fail.
  -- For strictness, let's fail, but the UI should ensure valid selection.
  IF NOT v_team_exists THEN
     -- Optional: Check if it's one of the hardcoded teams in JS and insert it?
     -- For now, let's assume teams are populated. 
     -- Or just proceed if you don't enforce strict FK in your mental model yet.
     -- Given the user asked for "users, teams, reports" creation, let's trust the FK.
     RAISE EXCEPTION 'Team "%" does not exist in teams table', p_team_name;
  END IF;

  -- 3. Check if report exists and get current status
  SELECT status INTO v_current_status FROM public.reports WHERE id = p_report_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report with ID % not found', p_report_id;
  END IF;

  -- 4. Update the report
  UPDATE public.reports
  SET 
    assigned_team = p_team_name,
    -- Logic: If assigning a team, it usually means work is starting ('ontheway')
    -- unless it's already resolved (maybe re-assigning for verification?)
    -- Let's set to 'ontheway' if it's 'pending'.
    status = CASE 
               WHEN status = 'pending' THEN 'ontheway'
               ELSE status 
             END,
    updated_at = now()
  WHERE id = p_report_id
  RETURNING to_jsonb(reports.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.assign_report_team(bigint, text) TO anon, authenticated;

COMMIT;
