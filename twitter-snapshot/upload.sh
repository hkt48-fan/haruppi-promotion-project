#!/bin/bash

scp `find ./snapshots -maxdepth 1 -type f -name '*_retina.png'` vultr.larvata.me:downloads/twitter
mv snapshots/*_retina.png snapshots/uploaded