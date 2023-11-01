CREATE TABLE cheesecakes (
id  SMALLSERIAL,
name varchar(256) not null,
position INTEGER not null,
ubication varchar(100) not null,
price varchar(32),
extra_info varchar(256)
);

CREATE TABLE burgers(
id  SMALLSERIAL,
name varchar(256) not null,
position INTEGER not null,
ubication varchar(100) not null,
price varchar(32),
extra_info varchar(256)
);

CREATE TABLE restaurants(
id  SMALLSERIAL,
name varchar(256) not null,
position INTEGER not null,
ubication varchar(100) not null,
price varchar(32),
extra_info varchar(256)
);

CREATE TABLE geo_ubications (
 id SMALLSERIAL,
 ubication varchar(100) not null UNIQUE,
 lat DOUBLE PRECISION not null,
 lon DOUBLE PRECISION not null
)