# Mock Data Synchronization Reference

This document outlines how all mock data is synchronized across the application.

## 🏢 Buyer Personas → Buyer Data → Buyer Contacts

### Active Buyers

| Persona ID | Buyer ID | Company Name | Region | Industry | Contact Count |
|------------|----------|--------------|---------|----------|---------------|
| `p_buyer_1` | `buyer_1` | **Ramesh Industries** | Maharashtra | Manufacturing | 3 |
| `p_buyer_2` | `buyer_2` | **Global Manufacturing Ltd** | Delhi NCR | Industrial Equipment | 4 |
| `p_buyer_3` | `buyer_3` | **TechnoSteel Corp** | Karnataka | Steel Products | 3 |

### Buyer Contacts Details

#### Ramesh Industries (`buyer_1`)
- **Ramesh Patel** (c_1) - Owner & MD - +91 98765 43210
- **Kavita Ramesh** (c_2) - Operations Manager - +91 98765 43211
- **Sanjay Deshmukh** (c_3) - Procurement Head - +91 98765 43212

#### Global Manufacturing Ltd (`buyer_2`)
- **Vikram Malhotra** (c_4) - CEO - +91 98765 43213
- **Anjali Kapoor** (c_5) - Purchase Manager - +91 98765 43214
- **Rajesh Nair** (c_6) - Supply Chain Director - +91 98765 43215
- **Priya Menon** (c_7) - Quality Control Head - +91 98765 43216

#### TechnoSteel Corp (`buyer_3`)
- **Arun Kumar** (c_8) - Managing Director - +91 98765 43217
- **Deepa Iyer** (c_9) - Procurement Officer - +91 98765 43218
- **Sunil Reddy** (c_10) - Materials Manager - +91 98765 43219

---

## 🏭 Seller Personas → Seller Data → Seller Contacts

### Active Sellers

| Persona ID | Seller ID | Company Name | Region | Industry | Contact Count | Status |
|------------|-----------|--------------|---------|----------|---------------|--------|
| `p_seller_1` | `seller_1` | **Suresh Industries** | Maharashtra | Steel Manufacturing | 3 | ✅ Active |
| `p_seller_2` | `seller_2` | **Om Steel Traders** | Rajasthan | Steel Trading | 2 | ❌ Inactive |
| `p_seller_3` | `seller_3` | **Rathi Metals** | Gujarat | Metal Products | 3 | ✅ Active |
| `p_seller_4` | `seller_4` | **Apex Alloys** | Tamil Nadu | Alloy Manufacturing | 3 | ✅ Active |
| `p_seller_5` | `seller_5` | **National Steel Corp** | West Bengal | Steel Products | 2 | ❌ Inactive |

### Seller Contacts Details

#### Suresh Industries (`seller_1`) - Active
- **Suresh Patil** (sc_1) - Owner - +91 98765 50001
- **Geeta Patil** (sc_2) - Sales Manager - +91 98765 50002
- **Mahesh Kulkarni** (sc_3) - Business Development - +91 98765 50003

#### Om Steel Traders (`seller_2`) - Inactive
- **Omprakash Sharma** (sc_4) - Proprietor - +91 98765 50004
- **Rakesh Sharma** (sc_5) - Sales Executive - +91 98765 50005

#### Rathi Metals (`seller_3`) - Active
- **Ashok Rathi** (sc_6) - Managing Director - +91 98765 50006
- **Neha Rathi** (sc_7) - Director - Operations - +91 98765 50007
- **Vijay Jadhav** (sc_8) - Sales Head - +91 98765 50008

#### Apex Alloys (`seller_4`) - Active
- **Mohan Gupta** (sc_9) - CEO - +91 98765 50009
- **Sunita Gupta** (sc_10) - Business Head - +91 98765 50010
- **Karan Singh** (sc_11) - Key Account Manager - +91 98765 50011

#### National Steel Corp (`seller_5`) - Inactive
- **Alok Verma** (sc_12) - Director - +91 98765 50012
- **Pooja Verma** (sc_13) - Sales Manager - +91 98765 50013

---

## 👥 Internal Team Personas

### Business Development Managers (BDM)

| Persona ID | User ID | Name | Avg Response Time |
|------------|---------|------|-------------------|
| `p_bdm_1` | `u_101` | **Amit Kumar (BDM)** | 3 minutes |
| `p_bdm_2` | `u_102` | **Priya Singh (BDM)** | 4 minutes |

### Category Managers (CM)

| Persona ID | User ID | Name | Category | Avg Response Time |
|------------|---------|------|----------|-------------------|
| `p_cm_north` | `u_210` | **Priya Sharma (CM - Steel)** | Steel | 4 minutes |
| `p_cm_south` | `u_211` | **Meera Iyer (CM - Polymer)** | Polymer | 5 minutes |
| `p_cm_east` | `u_212` | **Rajesh Kumar (CM - Cement)** | Cement | 6 minutes |
| `p_cm_west` | `u_213` | **Aditya Verma (CM - Bitumen)** | Bitumen | 5 minutes |

### Customer Experience (CX)

| Persona ID | User ID | Name | Avg Response Time |
|------------|---------|------|-------------------|
| `p_cx_1` | `u_301` | **Sneha Reddy (CX)** | 15 minutes |

---

## 🔄 Data Flow in Group Creation

### Step 1: Select External Users (Buyer Tab)
1. **User sees**: Buyer personas (Ramesh Industries, Global Manufacturing Ltd, TechnoSteel Corp)
2. **System maps**: `p_buyer_1` → `buyer_1` using `BUYER_PERSONA_TO_BUYER_MAP`
3. **System fetches**: Contacts for `buyer_1` from `MOCK_CONTACTS`
4. **User selects**: Individual contacts (e.g., Ramesh Patel, Kavita Ramesh)
5. **System marks**: Selected contacts for WhatsApp invitation

### Step 2: Select Internal Users
1. **User sees**: All internal personas (BDMs, CMs, CX) filtered by `isExternal: false`
2. **User chooses invitation method**:
   - "Add Internally" button (purple)
   - "WhatsApp" button (green)
   - Both buttons can be active (invitation method: "both")
3. **System tracks**: Each persona with their invitation method

### Step 3: Create Group
1. **System converts**: `SelectedMember[]` to `GroupMember[]`
2. **For contacts**: Maps `buyerPersonaId` back to `buyerId` for group naming
3. **System generates**: Group name using `generateGroupName()`
   - Single buyer: "Buyer <> Ramesh Industries"
   - Multiple buyers: "Group - Multiple Buyers"
   - No buyers: "Custom Group"
4. **System creates**: Pending group with status "pending"
5. **System displays**: "Waiting for members to join" message in Groups section

---

## 🧪 Testing Data Integrity

Run the comprehensive data sync test:
```bash
npm test src/domain/__tests__/data-sync.test.ts
```

This test verifies:
- ✅ All buyer personas map to valid buyers
- ✅ All buyers have contacts
- ✅ All contacts reference valid buyers
- ✅ Bidirectional persona↔buyer mapping works
- ✅ All seller personas map to valid sellers
- ✅ All sellers have contacts
- ✅ All contacts reference valid sellers
- ✅ Seller active status matches persona status
- ✅ All internal personas exist (BDMs, CMs, CX)
- ✅ Contact IDs are unique
- ✅ Persona IDs are unique
- ✅ Group creation data flow works end-to-end

---

## 📁 Related Files

### Persona Data
- `/src/domain/persona/persona.data.ts` - All personas (buyers, sellers, internal team)
- `/src/domain/persona/persona.profile-data.ts` - Detailed profile information

### Buyer Data
- `/src/domain/buyer/buyer.mock-data.ts` - Buyer companies and contacts
- `/src/domain/buyer/buyer.types.ts` - Type definitions
- `/src/domain/buyer/buyer-persona-mapping.ts` - Persona ↔ Buyer mapping

### Seller Data
- `/src/domain/seller/seller.mock-data.ts` - Seller companies and contacts
- `/src/domain/seller/seller.types.ts` - Type definitions (if exists)

### Group Creation
- `/src/app/components/GroupCreationModal.tsx` - Group creation UI
- `/src/domain/message/group.utils.ts` - Group name generation
- `/src/domain/message/group.types.ts` - Group type definitions

---

## 🔍 Quick Reference Mapping

```typescript
// Buyer Persona → Buyer Data
BUYER_PERSONA_TO_BUYER_MAP = {
  "p_buyer_1": "buyer_1",  // Ramesh Industries
  "p_buyer_2": "buyer_2",  // Global Manufacturing Ltd
  "p_buyer_3": "buyer_3",  // TechnoSteel Corp
}

// Seller Persona → Seller Data
SELLER_PERSONA_TO_SELLER_MAP = {
  "p_seller_1": "seller_1",  // Suresh Industries
  "p_seller_2": "seller_2",  // Om Steel Traders (inactive)
  "p_seller_3": "seller_3",  // Rathi Metals
  "p_seller_4": "seller_4",  // Apex Alloys
  "p_seller_5": "seller_5",  // National Steel Corp (inactive)
}
```

---

**Last Updated**: February 6, 2026
**Status**: ✅ All data synchronized and production-ready
