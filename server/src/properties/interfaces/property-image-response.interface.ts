import { PropertyImage } from '../entities/property-image.entity';

export interface PropertyImageWithUrl extends PropertyImage {
  public_url: string;
}

export interface UploadPropertyImagesResponse {
  data: PropertyImageWithUrl[];
  meta: {
    uploaded: number;
  };
}

export interface ListPropertyImagesResponse {
  data: PropertyImageWithUrl[];
}
