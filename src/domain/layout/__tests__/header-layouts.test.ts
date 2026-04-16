/**
 * Tests for header-layouts utilities
 */

import { describe, it, expect } from 'vitest';
import {
  createEnquiryHeaderLayout,
  createThreadHeaderLayout,
  createGroupHeaderLayout,
  createDMHeaderLayout,
  resolveHeaderContext,
} from '../header-layouts';

describe('createEnquiryHeaderLayout', () => {
  it('should create basic enquiry header layout', () => {
    const enquiry = {
      id: 'ENQ-1234',
      buyerName: 'Ramesh Industries',
    };
    
    const layout = createEnquiryHeaderLayout(enquiry);
    
    expect(layout.enquiryId).toBe('ENQ-1234');
    expect(layout.buyerName).toBe('Ramesh Industries');
    expect(layout.buyerPersonaId).toBeUndefined();
    expect(layout.value).toBeUndefined();
    expect(layout.categories).toBeUndefined();
    expect(layout.state).toBeUndefined();
  });

  it('should include all optional fields when provided', () => {
    const enquiry = {
      id: 'ENQ-1234',
      buyerName: 'Ramesh Industries',
      buyerPersonaId: 'p_buyer_1',
      estimatedValue: 450000,
      categories: [{ name: 'Steel' }, { name: 'Cement' }],
      state: 'RM Approved',
    };
    
    const layout = createEnquiryHeaderLayout(enquiry);
    
    expect(layout.enquiryId).toBe('ENQ-1234');
    expect(layout.buyerName).toBe('Ramesh Industries');
    expect(layout.buyerPersonaId).toBe('p_buyer_1');
    expect(layout.value).toBe(450000);
    expect(layout.categories).toEqual([{ name: 'Steel' }, { name: 'Cement' }]);
    expect(layout.state).toBe('RM Approved');
  });

  it('should include members and personas when provided', () => {
    const enquiry = {
      id: 'ENQ-1234',
      buyerName: 'Ramesh Industries',
    };
    
    const members = [
      { id: 'member-1', personaId: 'p_bdm_1', userId: 'user-1', role: 'BDM', joinedAt: new Date() },
    ];
    
    const personas = new Map();
    personas.set('p_bdm_1', { id: 'p_bdm_1', displayName: 'Amit Kumar', role: 'BDM' });
    
    const layout = createEnquiryHeaderLayout(enquiry, members, personas);
    
    expect(layout.members).toEqual(members);
    expect(layout.personas).toBe(personas);
  });
});

describe('createThreadHeaderLayout', () => {
  it('should create thread layout without enquiry data', () => {
    const thread = {
      id: 'thread-1',
      enquiryId: 'ENQ-1234',
      groupId: 'group-1',
    };
    
    const group = {
      id: 'group-1',
      name: 'Buyer Group',
    };
    
    const layout = createThreadHeaderLayout(thread, undefined, group, 'main');
    
    expect(layout.enquiryId).toBe('ENQ-1234');
    expect(layout.buyerName).toBe('New Thread');
    expect(layout.groupName).toBe('Buyer Group');
    expect(layout.groupId).toBe('group-1');
    expect(layout.mode).toBe('main');
  });

  it('should create thread layout with enquiry data', () => {
    const thread = {
      id: 'thread-1',
      enquiryId: 'ENQ-1234',
      groupId: 'group-1',
    };
    
    const enquiry = {
      id: 'ENQ-1234',
      buyerName: 'Ramesh Industries',
      estimatedValue: 450000,
      state: 'RM Approved',
    };
    
    const group = {
      id: 'group-1',
      name: 'Buyer Group',
    };
    
    const onClose = () => {};
    
    const layout = createThreadHeaderLayout(thread, enquiry, group, 'side-panel', onClose);
    
    expect(layout.enquiryId).toBe('ENQ-1234');
    expect(layout.buyerName).toBe('Ramesh Industries');
    expect(layout.value).toBe(450000);
    expect(layout.state).toBe('RM Approved');
    expect(layout.groupName).toBe('Buyer Group');
    expect(layout.groupId).toBe('group-1');
    expect(layout.mode).toBe('side-panel');
    expect(layout.onClose).toBe(onClose);
  });

  it('should work without group data', () => {
    const thread = {
      id: 'thread-1',
      enquiryId: 'ENQ-1234',
      groupId: 'group-1',
    };
    
    const enquiry = {
      id: 'ENQ-1234',
      buyerName: 'Ramesh Industries',
    };
    
    const layout = createThreadHeaderLayout(thread, enquiry);
    
    expect(layout.groupName).toBeUndefined();
    expect(layout.groupId).toBeUndefined();
  });
});

describe('createGroupHeaderLayout', () => {
  it('should create buyer group layout', () => {
    const group = {
      id: 'group-1',
      name: 'Ramesh Industries',
      type: 'buyer',
      buyerPersonaId: 'p_buyer_1',
    };
    
    const layout = createGroupHeaderLayout(group);
    
    expect(layout.groupName).toBe('Ramesh Industries');
    expect(layout.groupType).toBe('Buyer Group');
    expect(layout.groupPersonaId).toBe('p_buyer_1');
  });

  it('should create seller group layout', () => {
    const group = {
      id: 'group-1',
      name: 'Suresh Industries',
      type: 'seller',
      sellerId: 's_1',
    };
    
    const layout = createGroupHeaderLayout(group);
    
    expect(layout.groupName).toBe('Suresh Industries');
    expect(layout.groupType).toBe('Seller Group');
    expect(layout.groupPersonaId).toBe('s_1');
  });

  it('should create internal group layout', () => {
    const group = {
      id: 'group-1',
      name: 'Team Discussion',
      type: 'custom',
    };
    
    const layout = createGroupHeaderLayout(group);
    
    expect(layout.groupName).toBe('Team Discussion');
    expect(layout.groupType).toBe('Internal Group');
  });

  it('should include members and personas', () => {
    const group = {
      id: 'group-1',
      name: 'Team',
      type: 'custom',
    };
    
    const members = [
      { id: 'member-1', personaId: 'p_bdm_1', userId: 'user-1', role: 'BDM', joinedAt: new Date() },
    ];
    
    const personas = new Map();
    
    const layout = createGroupHeaderLayout(group, members, personas);
    
    expect(layout.members).toEqual(members);
    expect(layout.personas).toBe(personas);
  });
});

describe('createDMHeaderLayout', () => {
  it('should create buyer DM layout', () => {
    const dm = {
      id: 'dm-buyer-1',
      type: 'buyer',
    };
    
    const participant = {
      id: 'p_buyer_1',
      displayName: 'Ramesh Kumar',
      role: 'Buyer',
      isActive: true,
    };
    
    const layout = createDMHeaderLayout(dm, participant, '2 hours ago');
    
    expect(layout.participantName).toBe('Ramesh Kumar');
    expect(layout.participantId).toBe('p_buyer_1');
    expect(layout.dmType).toBe('buyer');
    expect(layout.lastSeen).toBe('2 hours ago');
    expect(layout.isActive).toBe(true);
  });

  it('should create seller DM layout', () => {
    const dm = {
      id: 'seller-dm-1',
      type: 'seller',
    };
    
    const participant = {
      id: 's_1',
      displayName: 'Suresh Industries',
      role: 'Seller',
    };
    
    const layout = createDMHeaderLayout(dm, participant);
    
    expect(layout.participantName).toBe('Suresh Industries');
    expect(layout.participantId).toBe('s_1');
    expect(layout.dmType).toBe('seller');
    expect(layout.lastSeen).toBeUndefined();
    expect(layout.isActive).toBeUndefined();
  });
});

describe('resolveHeaderContext', () => {
  it('should return "none" when nothing selected', () => {
    const context = resolveHeaderContext(
      null, // selectedEnquiryId
      null, // selectedBuyerDMId
      null, // selectedSellerDMId
      null, // selectedGroupId
      false, // threadPanelOpen
      'side-panel'
    );
    
    expect(context).toBe('none');
  });

  it('should return "thread" when thread panel open in main mode', () => {
    const context = resolveHeaderContext(
      null,
      null,
      null,
      null,
      true, // threadPanelOpen
      'main' // threadViewMode
    );
    
    expect(context).toBe('thread');
  });

  it('should return "dm" when buyer DM selected', () => {
    const context = resolveHeaderContext(
      null,
      'dm-buyer-1', // selectedBuyerDMId
      null,
      null,
      false,
      'side-panel'
    );
    
    expect(context).toBe('dm');
  });

  it('should return "dm" when seller DM selected', () => {
    const context = resolveHeaderContext(
      null,
      null,
      'dm-seller-1', // selectedSellerDMId
      null,
      false,
      'side-panel'
    );
    
    expect(context).toBe('dm');
  });

  it('should return "group" when group selected', () => {
    const context = resolveHeaderContext(
      null,
      null,
      null,
      'group-1', // selectedGroupId
      false,
      'side-panel'
    );
    
    expect(context).toBe('group');
  });

  it('should return "enquiry" when enquiry selected', () => {
    const context = resolveHeaderContext(
      'ENQ-1234', // selectedEnquiryId
      null,
      null,
      null,
      false,
      'side-panel'
    );
    
    expect(context).toBe('enquiry');
  });

  it('should prioritize thread main mode over enquiry', () => {
    const context = resolveHeaderContext(
      'ENQ-1234',
      null,
      null,
      null,
      true, // threadPanelOpen
      'main' // threadViewMode
    );
    
    expect(context).toBe('thread');
  });

  it('should prioritize buyer DM over group', () => {
    const context = resolveHeaderContext(
      null,
      'dm-buyer-1',
      null,
      'group-1',
      false,
      'side-panel'
    );
    
    expect(context).toBe('dm');
  });

  it('should prioritize seller DM over enquiry', () => {
    const context = resolveHeaderContext(
      'ENQ-1234',
      null,
      'dm-seller-1',
      null,
      false,
      'side-panel'
    );
    
    expect(context).toBe('dm');
  });

  it('should not return "thread" for side-panel mode', () => {
    const context = resolveHeaderContext(
      null,
      null,
      null,
      'group-1',
      true, // threadPanelOpen
      'side-panel' // side-panel mode
    );
    
    expect(context).toBe('group'); // Thread panel is secondary in side-panel mode
  });
});
