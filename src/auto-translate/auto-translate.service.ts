import { TranslationServiceClient } from '@google-cloud/translate';
import { Injectable } from '@nestjs/common';
import { v3 } from '@google-cloud/translate';
import { zipObject } from 'lodash';
import { SUPPORTED_LANGUAGES } from 'src/common/constants/constants';
import { google } from '@google-cloud/translate/build/protos/protos';

@Injectable()
export class AutoTranslateService {
  private readonly _projectId = 'acy-translation-api';
  private readonly _location = 'global';
  private readonly _translationClient: TranslationServiceClient;

  constructor() {
    this._translationClient = new v3.TranslationServiceClient({
      projectId: this._projectId,
    });
  }

  async translateText(
    text: string,
    targetLanguageCode: string,
  ): Promise<google.cloud.translation.v3.ITranslation[]> {
    // Construct request
    const request = {
      parent: `projects/${this._projectId}/locations/${this._location}`,
      contents: [text],
      mimeType: 'text/plain', // mime types: text/plain, text/html
      sourceLanguageCode: 'en',
      targetLanguageCode,
    };

    // Run request
    const [response] = await this._translationClient.translateText(request);

    return response.translations!;
  }

  async translateTextBulk(text: string) {
    const tasks = SUPPORTED_LANGUAGES.map(
      async (lan) => await this.translateText(text, lan),
    );
    const results = (await Promise.all(tasks))
      .flat()
      .flatMap((t) => t.translatedText);
    return zipObject(SUPPORTED_LANGUAGES, results);
  }
}
