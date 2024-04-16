# Project 3 -- Scaffold a MVC Application

Let's build an application from scratch! There are several goals with
this project.

1) Learn how to set up and structure a Model-View-Controller Application
2) Review the various technologies we have leveraged this semester
3) Prepare you for building a web application for your Capstone Project

Your app can do anything you'd like, but it has to support all of the
CRUD operations on at least one database table. If you can't think of
an application, then make a list to track todo lists.

## Overview

We'll do the following, roughly in order.

1) Set up a repository on Github
2) Set up the backend infrastructure (Python, Poetry, Fast API)
3) Set up the front-end infrastructure (React, Ant)
4) Set up the developer infrastructure (Docker, Docker Compose)
5) Set up the Database (Postgres)
6) Set up our Model-View-Controller Infrastructure
7) Create your application

Each of these steps require at least one commit. The last step will
likely require multiple commits.

## Set up a Github Repository

You know what to do. Make a project called Project 3. Your first
commit should contain a readme file with a short description of what
you intend for your application to do.

## Set up the Backend

We'll set this up directly in Python, not via Docker. You should have
Python installed in WSL, Linux, or Mac. You can confirm this by typing

```
$ python --version
```

If that doesn't work, try

```
$ python3 --version
```

Once you've got that set up, you should be able to install `poetry`
globally via pip and you should be good to go.

```
$ pip install poetry
```

Create a new Poetry project. To start, you'll include FastAPI and
uvicorn as dependencies. You'll also want to make sure you can get a
basic server up and running. [The "First Steps"
guide](https://fastapi.tiangolo.com/tutorial/first-steps/) for Fast
API should walk you through this.

We'll eventually want the route root to return our UI. The example
given in the FastAPI docs returns a JSON object. Let's fix this my
moving the route root to an API route (e.g. "/api/v1/hello") instead
of the root route. In the next section, we'll set up the route root so
it returns the UI.

Write a (very) short `curl` script that does a request that issues an
http request against your root route. While you're at it, add black,
isort and flake8 as dev dependencies and write a `check` script.

Now is probably a good time to make a commit and request a review, if
you haven't done that already.

## Set up the Front-End

Create a directory called "ui". This is where we'll put all of our
front-end work.

Go ahead and review Lab 6.  Start by initializing a Node.js project in
the UI directory. We'll scaffold a full react application (with an
`index.html`, a `styles.css` and a `main.jsx`) as we did previously.

Let's also go ahead and create a `check` script for our javascript
files.

### Connecting to the Backend

Now we need our Fast API server to serve up the files for our
front-end. To do that, we'll first need to add a new npm script to
build our UI.

```
    "build": "vite build",
```

Now when we run

```
$ npm run build
```

we should see a new directory called `dist` in our UI directory. Let's
first add that directory to our `.gitignore` file so we don't commit
it (as a general rule, we don't commit build artifacts to version
control).

As for integrating with our Fast API server, it's pretty
straight-forward. First, import static files:

```
from fastapi.staticfiles import StaticFiles
```

and then add this line to the end of your Fast API server:

```
app.mount("/", StaticFiles(directory="ui/dist", html=True), name="ui")
```

By adding this line to the end of all of our routes, we are saying "if
no previous routes matched, then return the file inside the ui/dist
directory if it exists."

Now when you run your Fast API server, you should see your UI served
up as the route root!

### Hot Reloading?

Now make a change to your front-end. Notice how our hot-reloading
feature that Vite supports is no longer working. :(

Unfortunately, I haven't figured out how to get all the way to
supporting hot-reloading, but we can support the next best thing,
which is to rebuild the `dist` directory whenever a file changes.

Let's change our npm `dev` script to the following:

```
    "dev": "vite build --watch",
```

Now we can run this script, along with running our Fast API server,
and when we make a change to the UI we can simply reload the browser
(CTRL/CMD-R) and see the associated changes.

It's probably a good time to commit and get a PR reviewed if you
haven't already. If you can figure out how to make hot-reloading work
with our setup, that will almost certainly exceed expectations on this
project.

## Set up a Better Developer Environment

Having to have two commands constantly running in two separate
terminals is kind of a pain, right? We'll improve our developer
environment so that developers only have to type a single command to
get everything up and running:

```
$ docker compose up
```

It will be a bit of a journey to get there, but we will by the end of
this section!

### Dockerfile

Start by reviewing the first part of Lab 5. We'll want to start by
creating a Dockerfile in the root directory of our project. Our
dockerfile will need to do a few things.

1. Start with a `python:latest` image.
2. Copy the contents of the project directory to `/app` on the container
3. Install poetry and the project's dependencies
4. Make the entrypoint our `uvicorn` command to launch the server
5. Your uvicorn command will need an additional parameter, `--host "0.0.0.0"`

Note that this doesn't actually build the UI (we'll take care of that
in a second), so before you actually build the image you'll need to
make sure you've run the npm build script at least once.

Once you're ready, build the image and tag it with
`project3:latest`. Then run it as described in Lab 4. Note that you'll
want to forward port 8000 on the container to 8000 on the host, and
you'll want to share your local project directory with the `/app`
directory on the container. All this is described in Lab 4.

Confirm everything is working by editing your server code (probably
your api's `hello` route) and make sure the server is reloading upon
the change. Since we're not currently running the UI `dev` script on
the container, we won't see our UI changes (yet!).

### Compose!

Now we're going to use Docker compose to run two containers at the
same time! The first container will be based on the image we just
created above, and the second one will keep watch over our UI for
changes.

The easiest way to get started is to create a simple `compose.yaml`
file that runs our server with all of those additional command-line
paramters that we use when we run `docker run`.

```
services:
  server:
    build:
      context: .
    ports:
      - "8000:8000"
    volumes:
      - ./app
```

Now when we run `docker compose up` as above, we'll see our container
running as before! This is much easier than the `docker run` command
we had to use to forward the port and share the directory, because now
all of that information is in the configuration file. But it gets even
better!

Let's add a second service called `ui` that runs our `dev`
script.

```
  ui:
    image: node:lts
    volumes:
      - ./ui:/ui
      - /ui/node_modules
    working_dir: /ui
    entrypoint: bash -c "npm ci && npm run dev"
```

Now let's delete our `dist` directory on our host machine so we can
start fresh.

Ideally, this would be all that's required. Spoiler alert: it's
not. Go ahead and run it and let's look at the output.

When I run it, I see a lot of errors, but this is the most
interesting.

```
server-1  | RuntimeError: Directory 'ui/dist' does not exist
```

The issue here is a race condition. The server can't start until the
UI is built, and compose is trying to start both containers at the
same time.

We need to tell compose that we want the server to wait until the ui
is built to make it work. That's not too hard. Modify your compose
file so it looks like this.

```yaml
services:
  server:
    build:
      context: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    depends_on:
      ui:
        condition: service_healthy

  ui:
    image: node:lts
    volumes:
      - ./ui:/ui
      - /ui/node_modules
    working_dir: /ui
    healthcheck:
      test: "ls dist"
      timeout: 60s
      interval: 10s
    entrypoint: bash -c "npm ci && npm run dev"
```

Note that we've added the `depends_on` entry to the `server` section,
and the `healthcheck` entry to the `ui` section. The latter tells
compose how to determine if the `ui` container is healthy (i.e. when
`ls dist` lists the contents of the directory without error`), and the
former tells compose not to start `server` until `ui` is healthy.

Go ahead and run `docker compose up` and try modifying the server
code. Make sure the server reloads. Now change the UI, and confirm
that the UI is being rebuilt. Note you'll still have to reload the
page for either server or client changes.

This is probably a good commit/PR point, so go ahead and do that.

## Set up the Database
