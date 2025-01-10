This backend use maven for depedency management, use `mvn install` to install dependecies.

This backend will be a stub for axelar network, monitor sigaccount and notify gateway

It also serves the role of storing and perform computation heavy works and provide user with information.

To set up, first do

`createdb truxtXchange_db`
if failed, do 
``` shell
psql -U postgres
postgres=# CREATE ROLE <you laptop logged in user name> WITH LOGIN SUPERUSER;
\q
```

Then, update your database connection info (eg: user name, password ) in the src/main/resources/application.properties file. 
There is an application.properties.sample file for your convenience. DO NOT COMMIT your application.properties.

If your frontend does not run on "http://localhost:5173", modify the trustXchange/config/WebConfig.java accordingly

Then, to start the server, do
run 
``` shell
mvn spring-boot::run
```
Flyway should automatically execute the sql migration files in main/resources/db folder.



in case you want to drop all table created, first connect via
```shell
psql -U <your user name> -d truxtXchange_db
```
then ensure the tables to drop are correct
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public';
```

``` sql
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;

    -- Drop all ENUM types
    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname
    ) LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END;
$$;
```


