export interface Instructor {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string;
  expertise?: string;
  summary?: string;
}

export interface CreateInstructorDto {
  name: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string;
  expertise?: string;
  summary?: string;
}

export type UpdateInstructorDto = CreateInstructorDto;
