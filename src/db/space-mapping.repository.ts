import db, { SpaceMapping } from '.'

export class SpaceMappingRepository {
  async findBySpaceId(id: string) {
    return SpaceMapping(db).findOne({ space_id: id })
  }

  async findByOcisSpaceId(id: string) {
    return SpaceMapping(db).findOne({ ocis_space_id: id })
  }

  async create(spaceId: string, ocisSpaceId: string) {
    return SpaceMapping(db).insert({ space_id: spaceId, ocis_space_id: ocisSpaceId })
  }
}
