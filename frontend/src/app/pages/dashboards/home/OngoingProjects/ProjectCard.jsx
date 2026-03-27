// Import Dependencies
import clsx from "clsx";
import PropTypes from "prop-types";

// Local Imports
import { Avatar, Card } from "components/ui";
import { useNavigate } from "react-router";

// ----------------------------------------------------------------------

export function ProjectCard({
  id,
  lead_name,
  status,
  source,
  email,
  phone,
  color = "primary"
}) {
  const displayName = lead_name || id;
  const navigate = useNavigate();
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <Avatar
          size={10}
          name={displayName}
          initialColor="auto"
        />
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/sales/leads/edit/${id}`)}>
          <div className="flex justify-between">
            <p className="truncate font-medium text-gray-800 dark:text-dark-100">
              {displayName}
            </p>
          </div>
          <div className="mt-0.5 flex text-xs text-gray-400 dark:text-dark-300">
            {status && (
              <p className="hidden sm:flex">{status}</p>
            )}
          </div>
        </div>
      </div>
      {source && (
        <p
          className={clsx(
            `this:${color}`,
            "-mt-3 text-end text-xs font-medium text-this dark:text-this-lighter",
          )}
        >
          {source}
        </p>
      )}
    </Card>
  );
}

ProjectCard.propTypes = {
  id: PropTypes.string,
  lead_name: PropTypes.string,
  status: PropTypes.string,
  source: PropTypes.string,
  email: PropTypes.string,
  phone: PropTypes.string,
  color: PropTypes.string,
};
