import LandlordForm from "./LandlordForm";
import TenantForm from "./TenantForm";
import ArtisanForm from "./ArtisanForm";

export default function SignUpForm({ role }) {
  switch (role) {
    case "landlord":
      return <LandlordForm />;
    case "tenant":
      return <TenantForm />;
    case "artisan":
      return <ArtisanForm />;
    default:
      return <p className="text-gray-600">Invalid role. Please go back and select one.</p>;
  }
}
