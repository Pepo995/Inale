# Welcome to queserosartesanales!

This project is thought to make the cheese producers life easy by automating the cheese batches certification.

## Technology used

- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js](https://nextjs.org)
- [Clerk](https://clerk.com)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Main folders

- `src/pages`: The pages using NextJS routing.
- `src/components`: Visual components with atomic design approach.
- `src/server/api/routers`: Internal API to communicate frontend with backend using TRPC.
- `src/pages/api/routers`: External API to expose endpoints to outside the project, documentation [here](https://documenter.getpostman.com/view/24166462/2s93m1ZjUs#57631dc7-f033-47bb-b0ac-9bd8985ad1f1).
- `src/server/controllers`: Controllers entrusted of the business logic.
- `src/server/infrastructure`: Repositories entrusted of the data and external connectivity.
- `src/server/tests`: Unit tests.

## How do I start running the project locally?

Just execute `npm i` to get the `node_modules` folder and then run the project with `npm run dev`.

## Future work

In future versions of the system we think some interesting features / fixes can be developed:

- Responsive design in admin to allow the admin to use the system with mobile devices.
- More reports to bring the admin the information of the project processed and simply.
- Download a QR for a batch in View Batch: To let the admin to access a QR code in other moment than when creating it.
- Add `*` to the mandatory fields to let the user know whether a field is mandatory or optional.
- Remove user + pass from Amplify’s environment variable DB_URL to prevent having sensible data outside the GitHub repository.

## Test

We have already developed unit test for the certification process and some other functions but it is still missing a bigger coverage to assure the code quality.

## More info

- CI/CD info in `.github/workflows/Readme.md`.
- About AWS services in `About_AWS.md`.
