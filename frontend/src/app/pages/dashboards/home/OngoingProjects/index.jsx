// Local Imports
import { ProjectCard } from "./ProjectCard";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useInfo, useFeachData } from "hooks/useApiHook";

// ----------------------------------------------------------------------

const doctype = "Lead"
const fields = ['lead_name', 'status', 'source', 'email_id', 'mobile_no']

export function OngoingProjects() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);

  const { data: info } = useInfo({ doctype, fields: JSON.stringify(fields) });
  const [search, setSearch] = useState({ doctype, page: 1, page_length: 5, fields: null, filters: JSON.stringify([["custom_next_follow_up_date", "=", new Date().toISOString().split("T")[0]]]) });
  const { data } = useFeachData(search);

  useEffect(() => {
    if (info?.fields) {
      const fieldnames = info?.fields.map(field => field.fieldname);
      setSearch({ ...search, fields: JSON.stringify([...fieldnames, "name"]) })
    }
  }, [info])

  useEffect(() => {
    if (data?.data) {
      setLists(data?.data)
    }
  }, [data])
  return (
    <div>
      <div className="flex min-w-0 items-center justify-between">
        <h2 className="truncate text-sm-plus font-medium tracking-wide text-gray-800 dark:text-dark-100">
          {"Today's Follow Ups"}
        </h2>
        <a
          onClick={() => navigate('/sales/leads')}
          className="border-b border-dotted border-current pb-0.5 text-xs-plus font-medium text-primary-600 outline-hidden transition-colors duration-300 hover:text-primary-600/70 focus:text-primary-600/70 dark:text-primary-400 dark:hover:text-primary-400/70 dark:focus:text-primary-400/70"
        >
          View All
        </a>
      </div>
      <div className="mt-3 space-y-3.5">
        {lists.map((lead) => (
          <ProjectCard key={lead.id} {...lead} />
        ))}
      </div>
    </div>
  );
}
