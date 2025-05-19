import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Define ProfileData interface
export interface ProfileData {
  user_id: string;
  full_name: string;
  email: string;
  profile_complete: boolean;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  school_name?: string;
  department?: string;
  level?: string;
  state_of_origin?: string;
  matric_number?: string;
  updated_at?: string;
  [key: string]: any; // Allow for any additional fields
}