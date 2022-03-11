CREATE SCHEMA IF NOT EXISTS booking;

CREATE TYPE tarifs_denotations AS ENUM ('base');
CREATE TYPE discount_values AS ENUM (5, 10, 18);
CREATE TYPE product_types AS ENUM ('car');

CREATE TABLE IF NOT EXISTS booking.orders(
  id VARCHAR(45) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  tarif tarifs_denotations,
  period INT NOT NULL,
  price INT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_DATE,
  PRIMARY KEY (id),
  CONSTRAINT fk_product_id
    FOREIGN KEY(product_id)
      REFERENCES booking.products(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS booking.active_orders AS 
TABLE booking.orders 
WITH NO DATA;

CREATE TABLE IF NOT EXISTS booking.products(
  id INT NOT NULL UNIQUE,
  product_type product_types,
  in_use BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_DATE,
  tarif tarifs_denotations,
  PRIMARY KEY (id)
);

INSERT INTO booking.products(id, product_type, tarif) VALUES(1, 'car', 'base');
INSERT INTO booking.products(id, product_type, tarif) VALUES(2, 'car', 'base');
INSERT INTO booking.products(id, product_type, tarif) VALUES(3, 'car', 'base');
INSERT INTO booking.products(id, product_type, tarif) VALUES(4, 'car', 'base');
INSERT INTO booking.products(id, product_type, tarif) VALUES(5, 'car', 'base');

CREATE TABLE IF NOT EXISTS booking.discounts(
  id INT NOT NULL UNIQUE,
  clause INT,
  percent INT,
  active_days INT
);

INSERT INTO booking.discounts(id, clause, percent, active_days) VALUES(1, 9, 5, 5);
INSERT INTO booking.discounts(id, clause, percent, active_days) VALUES(2, 17, 10, 8);
INSERT INTO booking.discounts(id, clause, percent, active_days) VALUES(3, 29, 15, 12);

CREATE TABLE IF NOT EXISTS booking.tarifs(
  id INT UNIQUE,
  price INT,
  denotation tarifs_denotations
);

INSERT INTO booking.tarifs(id, price, denotation) VALUES(1, 1000, 'base');