import { describe, it, expect, beforeEach } from "vitest";

const mockShipmentManager = {
  admin: "ST1ADMIN1111111111111111111111111111111",
  shipments: new Map<number, any>(),
  shipmentCounter: 0,

  isAdmin(caller: string) {
    return caller === this.admin;
  },

  transferAdmin(caller: string, newAdmin: string) {
    if (!this.isAdmin(caller)) return { error: 100 };
    this.admin = newAdmin;
    return { value: true };
  },

  createShipment(caller: string, recipient: string, metadataHash: string) {
    const id = ++this.shipmentCounter;
    this.shipments.set(id, {
      shipper: caller,
      carrier: null,
      recipient,
      status: 0,
      metadataHash,
    });
    return { value: id };
  },

  assignCarrier(caller: string, shipmentId: number, carrier: string) {
    if (!this.isAdmin(caller)) return { error: 100 };
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) return { error: 101 };
    shipment.carrier = carrier;
    return { value: true };
  },

  updateStatus(caller: string, shipmentId: number, newStatus: number) {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) return { error: 101 };

    switch (newStatus) {
      case 1: // In Transit
        if (caller !== shipment.carrier) return { error: 104 };
        shipment.status = 1;
        return { value: true };

      case 2: // Delivered
        if (caller !== shipment.recipient) return { error: 100 };
        shipment.status = 2;
        return { value: true };

      case 3: // Disputed
      case 4: // Cancelled
        if (caller !== shipment.shipper) return { error: 103 };
        shipment.status = newStatus;
        return { value: true };

      default:
        return { error: 102 };
    }
  },

  getShipment(id: number) {
    return this.shipments.get(id) || null;
  },

  getStatus(id: number) {
    const shipment = this.shipments.get(id);
    return shipment ? shipment.status : null;
  },
};

describe("CargoFlux ShipmentManager Contract (Mock)", () => {
  beforeEach(() => {
    mockShipmentManager.admin = "ST1ADMIN1111111111111111111111111111111";
    mockShipmentManager.shipmentCounter = 0;
    mockShipmentManager.shipments = new Map();
  });

  it("creates a shipment", () => {
    const res = mockShipmentManager.createShipment(
      "ST1SHIPPER11111111111111111111111111111",
      "ST1RECIPIENT1111111111111111111111111111",
      "0x1234abcd5678ef90deadbeefcafebabe12345678"
    );
    expect(res.value).toBe(1);
    const shipment = mockShipmentManager.getShipment(1);
    expect(shipment.shipper).toBe("ST1SHIPPER11111111111111111111111111111");
    expect(shipment.status).toBe(0);
  });

  it("assigns a carrier", () => {
    const shipper = "ST1SHIPPER";
    const carrier = "ST1CARRIER";
    const recipient = "ST1RECIPIENT";

    const id = mockShipmentManager.createShipment(shipper, recipient, "0xhash").value;
    const assignRes = mockShipmentManager.assignCarrier(mockShipmentManager.admin, id, carrier);
    expect(assignRes.value).toBe(true);

    const shipment = mockShipmentManager.getShipment(id);
    expect(shipment.carrier).toBe(carrier);
  });

  it("rejects unauthorized carrier assignment", () => {
    const id = mockShipmentManager.createShipment("ST1", "ST2", "0x00").value;
    const res = mockShipmentManager.assignCarrier("ST3NOTADMIN", id, "ST4");
    expect(res.error).toBe(100);
  });

  it("updates status to In Transit by carrier", () => {
    const shipper = "ST1";
    const recipient = "ST2";
    const carrier = "ST3";

    const id = mockShipmentManager.createShipment(shipper, recipient, "0x").value;
    mockShipmentManager.assignCarrier(mockShipmentManager.admin, id, carrier);

    const res = mockShipmentManager.updateStatus(carrier, id, 1);
    expect(res.value).toBe(true);
    expect(mockShipmentManager.getStatus(id)).toBe(1);
  });

  it("fails status update if caller isn't carrier", () => {
    const id = mockShipmentManager.createShipment("ST1", "ST2", "0x").value;
    mockShipmentManager.assignCarrier(mockShipmentManager.admin, id, "ST3");

    const res = mockShipmentManager.updateStatus("ST4NOTCARRIER", id, 1);
    expect(res.error).toBe(104);
  });

  it("transfers admin rights", () => {
    const newAdmin = "ST2NEWADMIN";
    const res = mockShipmentManager.transferAdmin(mockShipmentManager.admin, newAdmin);
    expect(res.value).toBe(true);
    expect(mockShipmentManager.admin).toBe(newAdmin);
  });

  it("blocks unauthorized admin transfer", () => {
    const res = mockShipmentManager.transferAdmin("ST4HACKER", "ST5");
    expect(res.error).toBe(100);
  });
});
