# cargoflux# CargoFlux

**Decentralized Freight Logistics Automation**

A blockchain-based logistics infrastructure for managing and verifying global shipment operations using smart contracts, offering transparency, automation, and trustless collaboration between shippers, carriers, customs, and insurers.

---

## **Overview**

CargoFlux consists of ten modular smart contracts that coordinate the core functions of decentralized shipping, from freight creation to proof-of-delivery and dispute resolution.

1. **ShipmentManager** – Creates and manages shipment lifecycles  
2. **FreightNFT** – Tokenizes freight as unique, traceable assets  
3. **EscrowVault** – Handles secure, conditional payments  
4. **ProofOfDelivery** – Verifies delivery using multi-party oracles  
5. **CustomsClearance** – Enables jurisdictional approvals and document verification  
6. **CarrierRegistry** – Manages verified transport providers and accountability  
7. **InsuranceContract** – Offers programmable freight insurance and payouts  
8. **DisputeResolution** – Facilitates arbitration in case of shipment issues  
9. **DocumentHashRegistry** – Stores and timestamps freight documents  
10. **AccessControlCenter** – Manages roles and permissions across the system  

---

## **Features**

- Tokenized freight shipment tracking  
- Secure, milestone-based payments via escrow  
- Trustless proof-of-delivery using oracles  
- Customs integration with on-chain document validation  
- Automated insurance offering and claims  
- Decentralized dispute resolution process  
- Role-based permission system for verified participants  
- Interoperable with off-chain logistics tools via events  

---

## **Smart Contracts**

### **ShipmentManager**

- Initializes and updates shipments  
- Links to FreightNFT and EscrowVault  
- Emits events for off-chain tracking  
- Supports status flags (e.g., in-transit, delivered, held)  

### **FreightNFT**

- ERC-721 representation of a shipment  
- Transferable ownership and metadata binding  
- Links to document hashes and shipment status  

### **EscrowVault**

- Locks shipper funds until proof-of-delivery  
- Handles partial or milestone payments  
- Integrates with DisputeResolution for conflict scenarios  

### **ProofOfDelivery**

- Uses GPS, signatures, or ZK-proofs for delivery validation  
- Multi-party attestation model (carrier + recipient + oracle)  
- Triggers escrow release and insurance finalization  

### **CustomsClearance**

- Interfaces with licensed customs agents  
- Enables on-chain approvals using IPFS docs and signatures  
- Jurisdictional compliance tracking  

### **CarrierRegistry**

- Stores verified carrier profiles  
- Supports staking for trust scores  
- Reputation and blacklist system  

### **InsuranceContract**

- On-chain freight insurance based on route risk  
- Dynamic premium calculation  
- Automated claim triggers for loss/delay events  

### **DisputeResolution**

- Open arbitration or delegated arbitrators  
- Handles payment freezes and verdict enforcement  
- Integrated with EscrowVault and ShipmentManager  

### **DocumentHashRegistry**

- Stores IPFS hashes of key documents (e.g., bill of lading)  
- Timestamping for audit and legal use  
- Used by customs, insurers, and courts  

### **AccessControlCenter**

- Role-based access for carriers, agents, ports, etc.  
- Permission enforcement across other contracts  
- On-chain identity verification  

---

## **Installation**

1. Install Clarinet CLI  
2. Clone this repository  
3. Compile contracts: `clarinet check`  
4. Run tests: `clarinet test`  
5. Deploy contracts: `clarinet deploy`  

---

## **Usage**

Each smart contract can be deployed independently. Contracts communicate through interfaces and events. Refer to the `/contracts` folder for details on each module's interface and deployment parameters.

---

## **Testing**

Tests are written using Clarinet and can be run with:

```bash
npm test
```

## **License**

MIT License
