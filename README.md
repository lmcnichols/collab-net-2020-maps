# 2020 Collaboration Network Map

A repositiory for the 2020 Collaboration Network Map. Documentation partially taken from (https://github.com/lmcnichols/collab-net-2020).

## Contributing

### Set up and installation.

Contributing to this repository requires that you have first installed Node.js and NPM as well as Google Chrome as the recommended browser. We reccommend using an environment manager such as Miniconda and installing the necessary tools in this environment. When you have installed [Miniconda](https://docs.conda.io/en/latest/miniconda.html) you can create a new environment by running
```
conda env create -n <NAME>
```

Then, activate this environment by running
```
conda activate <NAME>
```

You can download Node.js and NPM in this environment by running
```
conda install nodejs
```

Once you have downloaded nodejs in your system, you can launch the application by running
```
npm run start
```

You can launch the application in development mode (recommended for contributers) by running
```
npm run dev
```
*Dev mode has an additional package called nodemon which allows you to launch the application once and view your changes by simply refreshing the browser tab that the application is served on rather than re-launching the program every time you edit code.*