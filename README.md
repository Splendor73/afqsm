# AFQSM - AirFlow Quotation & Service Manager

AFQSM is a comprehensive web application designed for managing airflow equipment quotations and service scheduling. The application provides an efficient way for staff to create machine quotations based on CFM requirements and manage service schedules for installed equipment.

## Features

### Quotation Management
- Create detailed quotations based on client CFM requirements
- Optimize machine selection with cost-efficient combinations
- Preview total costs and machine specifications
- Track and manage quotation status

### Service Management
- Schedule and track maintenance services
- Manage parts inventory and requirements
- Assign technicians to service tasks
- Record completed services with parts usage

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Dashboard homepage
│   ├── quotations/               # Quotation pages
│   │   ├── page.tsx              # Quotations list view
│   │   └── new/                  # Create new quotation
│   │       └── page.tsx
│   └── services/                 # Service pages
│       ├── page.tsx              # Services list view
│       └── new/                  # Schedule new service
│           └── page.tsx
├── components/
│   ├── layout/                   # Layout components
│   │   └── Navigation.tsx        # Main navigation
│   ├── quotations/               # Quotation-specific components
│   ├── services/                 # Service-specific components
│   └── ui/                       # Reusable UI components
└── lib/                          # Utility functions and helpers
```

## Technology Stack

- **Framework**: Next.js 15
- **UI Libraries**: 
  - TailwindCSS for styling
  - Headless UI for accessible components
  - React Icons for iconography
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **Data Visualization**: Chart.js with react-chartjs-2

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/afqsm.git
cd afqsm
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Development Notes

### Data Structure

The application is designed around the following data models:

1. **Clients**: Organizations that purchase and use airflow equipment
2. **Machines**: Specific airflow equipment with CFM capacities and pricing
3. **Services**: Maintenance schedules and records for machines
4. **Parts**: Inventory of replacement parts used in services
5. **Technicians**: Staff assigned to perform services

### Future Enhancements

- User authentication and role-based access
- Email notifications for service reminders
- PDF generation for quotations and service reports
- Mobile application for technicians in the field
- Integration with accounting software

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact [support@example.com](mailto:support@example.com).
