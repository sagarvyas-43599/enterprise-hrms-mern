import { CompanySettingsModel, ICompanySettings } from '../models/setting.model';

export class SettingService {
  async getSettings(): Promise<ICompanySettings> {
    let settings = await CompanySettingsModel.findOne().exec();
    if (!settings) {
      settings = await CompanySettingsModel.create({});
    }
    return settings;
  }

  async updateSettings(
    payload: Partial<ICompanySettings>,
    actorEmail?: string
  ): Promise<ICompanySettings> {
    let settings = await CompanySettingsModel.findOne().exec();
    if (!settings) {
      settings = await CompanySettingsModel.create(payload);
    } else {
      Object.assign(settings, payload);
      await settings.save();
    }

    return settings;
  }
}
