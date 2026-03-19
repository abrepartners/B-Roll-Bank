# API Research Findings

## GoHighLevel (GHL)
- **Base URL**: `https://services.leadconnectorhq.com`
- **Authentication**: Bearer Token (Private Integration Token or OAuth Access Token)
- **Key Endpoints**:
  - **Search Opportunities**: `GET /opportunities/search`
    - **Parameters**: `location_id` (required), `pipeline_id`, `status` (open, won, lost, abandoned, all), `date` (start date), `endDate`.
    - **Revenue Data**: Opportunity objects typically contain a `monetaryValue` or similar field.
- **Notes**: Requires `location_id` for most requests.

## ClickUp
- **Base URL**: `https://api.clickup.com/api/v2`
- **Authentication**: Personal API Token (in `Authorization` header)
- **Key Endpoints**:
  - **Get Tasks**: `GET /list/{list_id}/task`
    - **Parameters**: `statuses[]` (filter by status), `include_closed`, `due_date_lt`, `due_date_gt`.
  - **Get Filtered Team Tasks**: `GET /team/{team_id}/task` (useful for cross-list searches).
- **Red Flags**: Can be defined by status (e.g., "Overdue", "Blocked") or by checking `due_date` against current time.
