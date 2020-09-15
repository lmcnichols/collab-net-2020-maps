# A Guide to Navigating Git

Documentation taken from (https://github.com/lmcnichols/collab-net-2020).


Always start by opening up your terminal and navigating to the folder that contains the repository. On my terminal I would type.

```cd git/collab/collab-net-2020-maps```

I like to start off by running the following command.

```git status```

This will tell you which branch you're on and if you have any modified files.

First, we want to make sure that we are up-to-date with the repository on the web. Make sure you are in your master branch by running the following command.

```git checkout master```

Then, run this command to get up to date with the web repo.

```git pull origin master  --rebase```

*If you want to simplify the above command, you can run the following command a single time and then you can thereafter leave off the `--rebase` part of the above command.*

```git config --global pull.rebase true```

Now, to create a new branch where you can do your work, run the following command.

```git checkout -b YOUR_BRANCH_NAME```

**It is probably a good idea for us too give our branch names our initials so that we don't accidentally end up using the same branch name.**

Now, you can make changes to files. when you have reached a good stopping point and you are ready to commit your files, you can run the following commands.

```git add .```

this will add all changes you've made to the repository including any files you added. Now, we need to commit those changes to our branch. we do that with the following command.

```git commit -m “WRITE A MESSAGE DESCRIBING YOUR CHANGES.”```

The final step is to push those changes too our repository on the web. we do this with the following command.

```git push origin YOUR_BRANCH_NAME```

Now, if you go to our repository on the web, you can find your branch. the next step would be to submit a pull request to get your changes merged into our master branch.

![image](https://user-images.githubusercontent.com/52261474/91771800-7513a700-eb98-11ea-93a8-4fc66d36c39a.png)

![image](https://user-images.githubusercontent.com/52261474/91771946-be63f680-eb98-11ea-943d-2d0db7536223.png)

Once that get's merged in, we should run the following command again to stay up to date.

```git pull origin master  --rebase```

