# Testing Guide: Create Enquiry From Thread

## Overview
This guide explains how to test the "Create Enquiry from Thread" feature both manually and automatically.

## Automated Tests

### Running Unit Tests
```bash
npm test src/domain/enquiry/__tests__/enquiry.thread-creation.test.ts
```

### Running Integration Tests
```bash
npm test src/app/__tests__/App.enquiry-from-thread.integration.test.tsx
```

### Test Coverage
The test suite covers:
- ✅ Sequential enquiry ID generation
- ✅ Thread lookup across multiple groups
- ✅ Buyer information resolution
- ✅ Enquiry creation with all required fields
- ✅ Thread tagging
- ✅ Team member auto-assignment
- ✅ Navigation state updates
- ✅ Error handling for missing threads
- ✅ Error handling for already-tagged threads
- ✅ Edge cases (empty lists, unknown buyers, etc.)

## Manual Testing Checklist

### Prerequisites
1. Switch to BDM persona
2. Navigate to Groups tab
3. Ensure there's at least one group with threads

### Test Case 1: Create Enquiry from Untagged Thread
**Steps:**
1. Open a thread that is NOT tagged to any enquiry
2. Click the "Tag Thread to Enquiry" button (Hash icon in header)
3. In the dialog, select "Create New Enquiry" (first option with Plus icon)
4. Buyer selector should appear below
5. Select a buyer from the dropdown
6. Click "Create Enquiry" button

**Expected Results:**
- ✅ Success toast: "Created enquiry ENQ-XXXX"
- ✅ View switches to Enquiry Threads tab
- ✅ Thread panel opens in main view
- ✅ Thread is now tagged with the new enquiry ID
- ✅ Thread header shows the enquiry tag
- ✅ Enquiry appears in sidebar with correct buyer name
- ✅ Team members are auto-assigned (BDM + CX)

### Test Case 2: Attempt to Create from Already Tagged Thread
**Steps:**
1. Open a thread that IS already tagged to an enquiry
2. Click the "Tag Thread to Enquiry" button
3. Dialog should show current enquiry, not allow re-tagging

**Expected Results:**
- ✅ Thread already shows enquiry tag in header
- ✅ Cannot create duplicate enquiry

### Test Case 3: Permission Check (Non-BDM)
**Steps:**
1. Switch to CM or CX persona
2. Open any thread
3. Click "Tag Thread to Enquiry"
4. Select "Create New Enquiry"
5. Select a buyer
6. Click "Create Enquiry"

**Expected Results:**
- ✅ Error toast: "Only BDMs can create new enquiries"
- ✅ No enquiry is created

### Test Case 4: Validation - No Buyer Selected
**Steps:**
1. As BDM, open untagged thread
2. Click "Tag Thread to Enquiry"
3. Select "Create New Enquiry"
4. Do NOT select a buyer
5. Try to click "Create Enquiry"

**Expected Results:**
- ✅ Button is disabled
- ✅ Cannot submit without buyer selection

### Test Case 5: Sequential ID Generation
**Steps:**
1. Note the highest existing enquiry ID (e.g., ENQ-2405)
2. Create a new enquiry from thread
3. Check the new enquiry ID

**Expected Results:**
- ✅ New ID is sequential (ENQ-2406)

### Test Case 6: Navigation State After Creation
**Steps:**
1. Before creating enquiry, note current view state
2. Create enquiry from thread
3. Check all navigation state

**Expected Results:**
- ✅ `selectedEnquiryId` = new enquiry ID
- ✅ `selectedThreadId` = thread ID
- ✅ `selectedGroupId` = group containing thread
- ✅ `selectedBuyerDMId` = null
- ✅ `selectedSellerDMId` = null
- ✅ `threadViewMode` = "main"
- ✅ `threadPanelOpen` = true
- ✅ `currentChannel` = "internal"

## Debugging

### Enable Debug Logs
Debug logs are automatically enabled in development mode. Look for console logs prefixed with:
- `[handleCreateEnquiryFromThread]`

### Common Issues and Solutions

#### Issue: Enquiry created but not visible
**Cause:** Navigation state not updated correctly
**Solution:** Check that all state setters are called in the handler

#### Issue: Thread not tagged after creation
**Cause:** THREAD_TAGGED event not dispatched or not handled
**Solution:** Verify messageDispatch is called for THREAD_TAGGED event

#### Issue: Team members not assigned
**Cause:** autoAssignTeamMembers events not dispatched
**Solution:** Verify all events from the result are dispatched

#### Issue: Wrong enquiry ID format
**Cause:** Regex bug in ID generation
**Solution:** Ensure regex is `/^ENQ-(\d+)$/` not `/^ENQ-(\\d+)$/`

#### Issue: Cannot find thread
**Cause:** Thread lookup failing across groups
**Solution:** Verify thread exists and groups array is populated

### Console Debugging
In browser console, you can inspect:
```javascript
// Check enquiries state
window.__ENQUIRIES__

// Check groups and threads
window.__GROUPS__

// Check current selection
window.__SELECTED_ENQUIRY_ID__
window.__SELECTED_THREAD_ID__
```

## Regression Tests

After making changes, ensure these still work:
1. ✅ Creating enquiry from share modal (existing flow)
2. ✅ Tagging thread to existing enquiry
3. ✅ Viewing thread in side panel vs main view
4. ✅ Thread message rendering
5. ✅ Thread header display
6. ✅ Enquiry filtering by persona

## Performance Considerations

The implementation is optimized for:
- **O(n)** thread lookup across groups
- **O(n)** enquiry ID generation
- **Minimal re-renders** via useCallback
- **Batched state updates** for navigation

## Known Limitations

1. Cannot create enquiry from thread if user is not BDM
2. Cannot re-tag already tagged threads
3. Buyer must be selected (no auto-detection from thread content)

## Future Enhancements

Potential improvements:
- [ ] Auto-detect buyer from thread messages
- [ ] Allow CM to create enquiries with approval
- [ ] Bulk thread tagging
- [ ] Undo enquiry creation
- [ ] Thread preview before creating enquiry
