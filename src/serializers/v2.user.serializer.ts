import { Serializer } from 'jsonapi-serializer';
import { CORE_FIELDS, getAreaOrRegionOfInterest, IUser, LEGACY_GFW_FIELDS } from 'models/user';
import { pick } from 'lodash';

const v2UserSerializer: Serializer = new Serializer('user', {
    attributes: [
        'fullName',
        'firstName',
        'lastName',
        'email',
        'createdAt',
        'applicationData',
    ],
    typeForAttribute: (attribute: string) => attribute,
    keyForAttribute: 'camelCase',
    transform: (record: IUser): Record<string, any> => {
        return {
            id: record.id,
            ...pick(record, CORE_FIELDS),
            applicationData: {
                ...record.applicationData,
                gfw: {
                    ...record.applicationData.gfw,
                    ...pick(record, LEGACY_GFW_FIELDS),
                    areaOrRegionOfInterest: getAreaOrRegionOfInterest(record)
                }
            }

        }
    }
});

export default class V2UserSerializer {

    static serialize(data: Record<string, any>): Record<string, any> {
        return v2UserSerializer.serialize(data);
    }

}

