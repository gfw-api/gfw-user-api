import type { Document, Model, Schema as ISchema } from 'mongoose';
import { model, Schema } from 'mongoose';

export const CORE_FIELDS: string[] = ['fullName', 'firstName', 'lastName', 'email', 'createdAt'];

export const LEGACY_GFW_FIELDS: string[] = ['oldId', 'country', 'sector', 'country', 'state', 'city', 'howDoYouUse', 'primaryResponsibilities', 'signUpForTesting', 'language', 'profileComplete', 'subsector', 'jobTitle', 'company', 'aoiCountry', 'aoiState', 'aoiCity', 'interests', 'signUpToNewsletter', 'topics'];

export interface IUser extends Document {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string,
    oldId?: number,
    createdAt?: Date,
    sector?: string,
    country?: string,
    state?: string,
    city?: string,
    howDoYouUse?: any,
    primaryResponsibilities?: any,
    signUpForTesting?: boolean,
    language?: string,
    profileComplete?: boolean,
    subsector?: string,
    jobTitle?: string,
    company?: string,
    aoiCountry?: string,
    aoiState?: string,
    aoiCity?: string,
    interests?: any,
    signUpToNewsletter?: boolean,
    topics?: any,
    applicationData: Record<string, Record<string, any>>;
}

export const User: ISchema<IUser> = new Schema<IUser>({
    fullName: { type: String, required: false, trim: true },
    firstName: { type: String, required: false, trim: true },
    lastName: { type: String, required: false, trim: true },
    oldId: { type: Number, required: false },
    email: { type: String, required: false, trim: true },
    createdAt: { type: Date, required: false, default: new Date() },
    sector: { type: String, required: false, trim: true },
    country: { type: String, required: false, trim: true },
    state: { type: String, required: false, trim: true },
    city: { type: String, required: false, trim: true },
    howDoYouUse: { type: Array, default: [] },
    primaryResponsibilities: { type: Array, default: [] },
    signUpForTesting: { type: Boolean, default: false },
    language: { type: String, required: false },
    profileComplete: { type: Boolean, default: false },
    subsector: { type: String, required: false, trim: true },
    jobTitle: { type: String, trim: true },
    company: { type: String, trim: true },
    aoiCountry: { type: String, trim: true },
    aoiState: { type: String, trim: true },
    aoiCity: { type: String, trim: true },
    interests: { type: Array, default: [] },
    signUpToNewsletter: { type: Boolean, default: false },
    topics: { type: Array, default: [] },
    applicationData: { type: Object, default: {} }
});

const UserModel: Model<IUser> = model<IUser>('User', User);

export default UserModel;
