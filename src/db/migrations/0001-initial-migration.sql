CREATE TABLE user_mapping (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    ocis_user_id VARCHAR(255) NOT NULL UNIQUE
);
CREATE INDEX user_mapping_user_id_idx ON user_mapping (user_id);
CREATE INDEX user_mapping_ocis_user_id_idx ON user_mapping (ocis_user_id);
CREATE TABLE space_mapping (
    id SERIAL PRIMARY KEY,
    space_id VARCHAR(255) NOT NULL UNIQUE,
    ocis_space_id VARCHAR(255) NOT NULL UNIQUE
);
CREATE INDEX space_mapping_space_id_idx ON space_mapping (space_id);
CREATE INDEX space_mapping_ocis_space_id_idx ON space_mapping (ocis_space_id);