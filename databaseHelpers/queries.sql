CREATE TABLE cheesecakes (
id  SMALLSERIAL,
name varchar(256) not null,
position INTEGER not null,
ubication varchar(100) not null,
price varchar(32),
extra_info varchar(256)
);

BEGIN;

-- Update the target item's position
UPDATE cheesecakes
SET position = 5
WHERE id = 1;

-- Update the positions of remaining items
UPDATE cheesecakes
SET position = position + 1
WHERE position >= 5
  AND id != 1;

COMMIT;
