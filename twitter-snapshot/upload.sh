#!/bin/bash

scp `find ./snapshots -maxdepth 1 -type f -name '*_retina.png'` vultr.larvata.me:downloads/twitter
if [[ $? != 0 ]]; then
  echo 'Error occured.'
else
  mv snapshots/*_retina.png snapshots/uploaded
fi