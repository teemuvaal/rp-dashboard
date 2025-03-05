# Fixing ON CONFLICT Issues in the App

## Issues Identified

1. Several functions in the codebase were using patterns that can trigger the "no unique or exclusion constraint matching the ON CONFLICT specification" error:
   - Chaining `.select()` directly after `.insert()` or `.update()` operations
   - Using `.upsert()` without having proper unique constraints on the tables

## Functions Fixed So Far

1. `updateAsset`: Updated to use the two-step pattern (update then fetch separately)
2. `saveSummary`: Replaced upsert with check-then-insert/update pattern
3. `saveNarrativeSummary`: Replaced upsert with check-then-insert/update pattern
4. `createAsset`: Was already using the correct pattern (no changes needed)
5. `updateNote`: Was already using the correct pattern (no changes needed)
6. `queueEmbedding`: Was already using delete-then-insert pattern (no changes needed)

## SQL Scripts Created

1. `add_missing_constraints.sql`: Adds missing unique constraints to several tables
2. `find_affected_functions.sql`: Helps find all unique constraints and potential conflict sources
3. `troubleshoot_notes_table.sql`: SQL queries to inspect the notes table for constraint issues

## Best Practices Guide

We've created a comprehensive guide (`supabase_operations_best_practices.md`) that explains:

- The two-step pattern for insert operations (insert then fetch)
- The two-step pattern for update operations (update then fetch)
- The delete-then-insert pattern to replace upsert operations
- Patterns to avoid that can trigger ON CONFLICT errors

## Remaining Items to Check

The following functions might still need updates to follow the best practices:

1. Functions that use upsert operations:
   - `saveVisualSummary`
   - `saveNarrativeContent` (if it exists)
   - Any other function using `.upsert()`

2. Functions that chain `.select()` after `.insert()` or `.update()`:
   - Many functions in `actions.js` appear to use this pattern

## Steps to Fix All Issues

1. Run the SQL scripts:

   ```bash
   psql -U postgres -f add_missing_constraints.sql
   ```

2. Apply the two-step pattern to all remaining functions:
   - For insert operations: Insert with `.select('id')`, then fetch with a separate query
   - For update operations: Update without chaining `.select()`, then fetch with a separate query
   - For upsert operations: Replace with check-then-insert/update logic

3. Test the application thoroughly:
   - Pay special attention to features that create or update records
   - Monitor the logs for similar errors

## Why This Issue Is Happening

This issue typically occurs because the Supabase client library tries to optimize operations by using ON CONFLICT clauses internally when chaining `.select()` after `.insert()` or `.update()`. 

The issue can also be triggered by the Supabase client library version - newer versions might be more strict about requiring unique constraints for operations that internally use ON CONFLICT clauses.

By following the patterns outlined in the best practices guide, you avoid these issues by separating the operations into distinct steps that don't rely on ON CONFLICT clauses. 