# DSA SDK

This is a main DSA SDK package (WIP).

Please read our [developer doc](https://github.com/InstaDApp/dsa-developers) for more.

## To Test In Browser

1. Run `npm install` to install needed dependencies
2. Run `npm run dev-server` to start 
3. Navigate to `localhost:8080`
4. Call `InitWeb3()` in debugger console
5. Access the DSA object via `window.dsa`
6. Note that you need to call dsa= new DSA(web3) again. (fix coming up)

## Contributing

1.  Fork and clone it
1.  Install dependencies: `npm install`
1.  Create a feature branch: `git checkout -b new-feature`
1.  Commit changes: `git commit -am 'Added a feature'`
1.  Push to the remote branch: `git push origin new-feature`
1.  Create a new [Pull Request](https://github.com/instadapp/dsa-sdk/pull/new/master)