// Local Imports
import { Page } from "components/shared/Page";
import { Statistics } from "./Statistics";
import { OngoingProjects } from "./OngoingProjects";
import { ClientMessages } from "./ClientMessages";
import { SalesReport } from "./SalesReport";
import { SalesMessages } from "./SalesMessages";

// ----------------------------------------------------------------------

export default function Home() {
  return (
    <Page title="Dashboard">
      <div className="transition-content px-(--margin-x) pb-8 mt-5 lg:mt-6">
        <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
          <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-8 lg:space-y-6">
            <Statistics />
            <OngoingProjects />
            <SalesReport />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-1 lg:gap-6">
              <ClientMessages />
              <SalesMessages />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
