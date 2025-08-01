;; CargoFlux - Shipment Manager Contract
;; Handles creation, tracking, and status updates of tokenized shipments

;; Admin setup
(define-data-var admin principal tx-sender)

;; Shipment data structure
(define-map shipments
  uint
  {
    shipper: principal,
    carrier: (optional principal),
    recipient: principal,
    status: uint, ;; 0 = Created, 1 = In Transit, 2 = Delivered, 3 = Disputed, 4 = Cancelled
    metadata-hash: (buff 32)
  })

(define-data-var shipment-counter uint u0)

;; Constants for status codes
(define-constant STATUS-CREATED u0)
(define-constant STATUS-IN-TRANSIT u1)
(define-constant STATUS-DELIVERED u2)
(define-constant STATUS-DISPUTED u3)
(define-constant STATUS-CANCELLED u4)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-NOT-FOUND u101)
(define-constant ERR-INVALID-STATUS u102)
(define-constant ERR-ONLY-SHIPPER u103)
(define-constant ERR-ONLY-CARRIER u104)

;; Private function to check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin)))

;; Public function to transfer admin
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)))

;; Public function to create a shipment
(define-public (create-shipment (recipient principal) (metadata-hash (buff 32)))
  (let ((id (+ u1 (var-get shipment-counter))))
    (begin
      (map-set shipments id {
        shipper: tx-sender,
        carrier: none,
        recipient: recipient,
        status: STATUS-CREATED,
        metadata-hash: metadata-hash
      })
      (var-set shipment-counter id)
      (ok id))))

;; Assign a carrier (admin-only)
(define-public (assign-carrier (shipment-id uint) (carrier principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((shipment (map-get? shipments shipment-id)))
      (match shipment
        shipment-data
        (begin
          (map-set shipments shipment-id (merge shipment-data {
            carrier: (some carrier)
          }))
          (ok true))
        (err ERR-NOT-FOUND)))))

;; Update shipment status (carrier or shipper depending on state)
(define-public (update-status (shipment-id uint) (new-status uint))
  (let ((shipment (map-get? shipments shipment-id)))
    (match shipment
      shipment-data
      (let ((current-status (get status shipment-data)))
        (cond
          ((is-eq new-status STATUS-IN-TRANSIT)
            (asserts! (is-eq tx-sender (default tx-sender (get carrier shipment-data))) (err ERR-ONLY-CARRIER))
            (ok (map-set shipments shipment-id (merge shipment-data { status: STATUS-IN-TRANSIT }))))

          ((is-eq new-status STATUS-DELIVERED)
            (asserts! (is-eq tx-sender (get recipient shipment-data)) (err ERR-NOT-AUTHORIZED))
            (ok (map-set shipments shipment-id (merge shipment-data { status: STATUS-DELIVERED }))))

          ((is-eq new-status STATUS-DISPUTED)
            (asserts! (is-eq tx-sender (get shipper shipment-data)) (err ERR-ONLY-SHIPPER))
            (ok (map-set shipments shipment-id (merge shipment-data { status: STATUS-DISPUTED }))))

          ((is-eq new-status STATUS-CANCELLED)
            (asserts! (is-eq tx-sender (get shipper shipment-data)) (err ERR-ONLY-SHIPPER))
            (ok (map-set shipments shipment-id (merge shipment-data { status: STATUS-CANCELLED }))))

          (true (err ERR-INVALID-STATUS))))
      (err ERR-NOT-FOUND))))

;; Read-only function to get shipment data
(define-read-only (get-shipment (shipment-id uint))
  (map-get? shipments shipment-id))

;; Read-only function to check current shipment status
(define-read-only (get-status (shipment-id uint))
  (let ((shipment (map-get? shipments shipment-id)))
    (match shipment
      data (ok (get status data))
      (err ERR-NOT-FOUND))))
