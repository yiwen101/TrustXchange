vite react app with recoil for state management

api are interned for methods to communicate with blockchain and backend

pages and components use hook to access and modify state

hooks link between react components and apis. api should only be called by "hooks"

component folder is intended for reusable components

You can manage Route on InitLoader and Navbar 

Add initialisation methods in Init which is called in the InitLoader. Do use treadpool.

please try to practice DRY principle

The `shell` folder may be confusing. It exists because I did not know the in built `vite --open` , and produce a script for the same funcionality.To run `npm run browser`, need to chmod +x shell/browser.sh frist. But `npm run b`does exactly the same.