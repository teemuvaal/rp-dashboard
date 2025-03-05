# Supabase Operations Best Practices

## Avoiding ON CONFLICT Issues

When working with Supabase client, follow these patterns to avoid the "no unique or exclusion constraint matching the ON CONFLICT specification" error:

### Pattern 1: Two-Step Create (Insert)

```javascript
// CORRECT: Two-step approach
// Step 1: Insert and only get the ID
const { data: insertData, error } = await supabase
    .from('table_name')
    .insert({
        // your data here
    })
    .select('id'); // Only get the ID

if (error) return { error };

const recordId = insertData[0].id;

// Step 2: Fetch the complete record separately
const { data: completeData, error: fetchError } = await supabase
    .from('table_name')
    .select('*, related_table(*)')  // You can include joins here
    .eq('id', recordId)
    .single();
```

### Pattern 2: Two-Step Update

```javascript
// CORRECT: Two-step approach
// Step 1: Update without returning data
const { error } = await supabase
    .from('table_name')
    .update({
        // your data here
    })
    .eq('id', recordId);

if (error) return { error };

// Step 2: Fetch the updated record separately
const { data: updatedData, error: fetchError } = await supabase
    .from('table_name')
    .select('*, related_table(*)')  // You can include joins here
    .eq('id', recordId)
    .single();
```

### Pattern 3: Delete-Then-Insert (Instead of Upsert)

When you need to replace records (for example in a one-to-many relationship):

```javascript
// CORRECT: Delete-then-insert approach
// Step 1: Delete existing records
const { error: deleteError } = await supabase
    .from('table_name')
    .delete()
    .match({ foreign_key: parentId });

if (deleteError) return { error: deleteError };

// Step 2: Insert new records (no upsert needed)
const { data: insertData, error: insertError } = await supabase
    .from('table_name')
    .insert(newRecords);
```

### AVOID THESE PATTERNS

```javascript
// INCORRECT: Chaining select after insert or update
const { data, error } = await supabase
    .from('table_name')
    .insert({ /* data */ })
    .select('*, related_table(*)');  // DON'T do this

// INCORRECT: Using upsert without proper unique constraints
const { data, error } = await supabase
    .from('table_name')
    .upsert({ /* data */ }, {
        onConflict: 'column_without_unique_constraint'  // DON'T do this unless you've verified the constraint exists
    });
```

## Troubleshooting

If you encounter ON CONFLICT errors:

1. Check if the table has the appropriate unique constraints
2. Use the two-step pattern (insert/update + separate fetch)
3. Avoid complex select chains after insert/update operations
4. For replacing related records, use delete-then-insert instead of upsert 