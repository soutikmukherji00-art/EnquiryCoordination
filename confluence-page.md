# Pluto to Prism — Design Requirements

Version: 9

---

**Feature**

**Description/ Flow**

**Prio**

1

**\[Δ Buyer RFQ Digitization - Mail\]**  
User Flow - Email based enquiry in Prism

1.  Buyer sends mail to BP enquiry
2.  Bot classifies mail. Bot forwards mail body to Buyer <> BDM mail group.
3.  Bot auto tags mail body to new enquiry thread.
4.  BDM will share the mail body from Buyer <> BDM group to internal - while maintaining tagged enquiry ID.

**P0**

2

**\[Δ** **Buyer RFQ Digitization - Mail\]**  
Show WhatsApp & Email groups for an external user

Unread Message Count, On Hover Buyer Card

**P0**

3

**\[Δ** **Buyer RFQ Digitization - WA\]**  
User Flow - WhatsApp Bot based Enquiry

1.  Buyer sends message to WA Bot number.
2.  Bot forwards message to Buyer <> BDM WA group.
3.  Bot auto tags message to new enquiry thread.
4.  BDM will share the message from Buyer <> BDM group to internal - while maintaining tagged enquiry ID.

**P0**

4

**\[Δ** **Buyer RFQ Digitization - Mail\]**  
Leads Team View

1.  Lead Team View — a list of inbox with unattributed messages & Email.
2.  Their ability to assign a BDM for Email & WhatsApp.

**P2**

5

**\[Δ** **Seller RFQ Digitization\]**  
User Flow - Seller RFQ response through chat

1.  CM shares requirement in CM <> Seller Group
2.  Seller responds to requirement.
3.  CM shares response to Enquiry Thread.
4.  System Nudges **\[Is this Seller RFQ?\]**
5.  If yes, BDM is notified (?) and Structured Data Panel Updated (?)

6

**\[Δ** **Seller RFQ Digitization\]**  
Chat Command @sellerRFQ - Needs Discussion

1.  CM types chat command in CM <> Seller Group.
2.  Bot sends form to seller.
3.  Seller Fills form and Submits
4.  ?

**P1**

7

**\[Δ** **Seller RFQ Digitization\]**  
User Flow - Quote PDF Download

1.  BDM navigates to Enquiry Documents
2.  Previews and Downloads Quote PDF

8

**\[Δ** **Direct PO Ordering\]**  
User Flow - Create new enquiry using PO.

1.  BDM creates **New Enquiry** through **\[+\]**
2.  BDM is able to add documents & voice notes along with text notes
3.  When document is uploaded, system gives a nudge **\[Is this a PO?\]** - for v0.
4.  If yes, system creates enquiry, does PO enrichment.
5.  BDM reviews extracted PO details in **structured data.**
6.  BDM marks enquiry as won. Tags CM for review.
7.  CM verifies PO & Confirms for Order.
8.  Roles flipped if CM starts (?)

**P0**

9

**\[Δ** **Direct PO Ordering\]**  
User Flow - Share PO to existing enquiry thread.

1.  BDM shares attachment in enquiry thread
2.  System nudges **\[Is this a PO?\]** - for v0.
3.  If yes, system enriches PO.
4.  BDM reviews extracted PO details in **structured data.**
5.  BDM marks enquiry as won. Tags CM for review.
6.  CM verifies PO & Confirms for Order.
7.  Roles flipped if CM starts (?)

**P0**

10

**\[Δ Credit Validation at Buyer PO Upload\]**  
System Nudge - Add Deal Amount

1.  Primary action - system nudges BDM to add deal amount
2.  Secondary action - \[Don’t have deal amount? Ask Buyer\] nudge.
3.  BDM can share templated message automatically to Buyer if secondary action selected.

11

**\[Δ Credit Validation at Buyer PO Upload\]**  
User Flow - Credit Validation

1.  BDM uploads PO to Enquiry Thread
2.  System checks Credit availability during enrichment.
3.  If Check passes - Mark as Won is enabled
4.  If Check fails - CTA changes to Raise Request

Approval Flow:

1.  Copy of Approval Status \[Accepted or Rejected\] should come in Enquiry Thread

12

**\[Δ Logistics RFQ Flow\]**  
User Flow - Logistics RFQ through Chat

1.  CM tags LM in internal group with freight requirement.
2.  LM shares message to LM <> Transport Provider Group
3.  Transporter Provider responds.
4.  LM shares Response back to Internal group - Marks it as Logistic Response
5.  System Enriches message, structured data widget updated.
6.  CM shares updated price to BDM.

13

**\[Δ Logistics RFQ Flow\]**  
Chat Command @logisticsRFQ - Needs Discussion

1.  LM types chat command in LM <> Transport Provider Group.
2.  Bot sends form to Provider.
3.  Provider Fills form and Submits

14

**\[Prism\]**  
Structured Data Panel: BDMs

Idea: AI enriches chat conversation and PO to backfill extracted values to Pluto form embedded in Prism

UI Component - Available on demand aside panel

BDM —

**Panel 1:** Quote Details

1.  About Buyer
    1.  Buyer Name
    2.  Shipping Address

2.  Payment Terms
    1.  Scope of Unloading
    2.  Expected ETA
    3.  Deal amount
    4.  Payment Terms
    5.  Enhancer Type
    6.  IDD / MDD

**Panel 2:** Products

1.  Cart Page
2.  Add by Search \[Modal?\]
3.  Add by Make \[Modal?\]

**P0**

15

**\[Prism\]**  
Structured Data Panel: CMs

Idea: AI enriches chat conversation and PO to backfill extracted values to Pluto form embedded in Prism

CM —

1.  About Seller  
    a. Seller Payment Terms  
    b. Seller IDD
2.  About Logistics  
    a. Logistics Provider  
    b. Delivery ETA from Order  
    c. Rate Expiry Date

    If BP Shipped:  
    f. BP Shipped Payment Mode  
    d. Per Ton/Per Vehicle  
    g. BP Shipped Rates/MT / BP Shipped Rates/Vehicle  
    h. Total Tonnage / No. of Vehicle  
    i. Total Shipping charges to Buyer 

3.  Quote Details  
    a. Seller Base Price  
    b. Buyer Price

16

**\[Prism\]** Chat Command

@add_by_make @add_products

1.  User puts command in any Enquiry Thread chat.
2.  Bot shows widget for Add Product.
3.  User adds required products.
4.  Products reflect in Cart Page - Structured Data.

**P1**

17

**\[Prism\]** Display of Enquiry ID at thread level Connect chats

If thread is tagged to an enquiry, show Enquiry ID upfront. Scope: One per thread

**P0**

18

**\[Δ** **Pluto\]** Enquiry Sort & Filter

Allow users to search enquiries effectively.

**P2**

19

**\[Δ** **Pluto\]** Add New Buyer to Master

1.  Think of Touch Points.
2.  Create New Enquiry.

20

**\[Prism\]** Contact Cards and Adding contact to Master

When lead team sends leads in terms of contacts cards.

**P0**

Open Points:

1.  How do sellers communicate right now? Will we need a Seller Mail group like Seller WhatsApp group? - Ans: Yes both
2.  What is the user story of re-tagging an Email to an existing enquiry ID? Is it required? - Ans: In case mail is sent by different mail ID.
3.  Will Lead management team have a Prism Touchpoint or will it data directly flow from Growth Hub to Prism? - Ans: Data flow needs to Happen
4.  Till when should the BDMs have the ability to change any of the Quote Details in Structured Data? Example: Shipping Address.
5.  How do they add margins right now? Is it just on the product or on both the product & logistics price?
