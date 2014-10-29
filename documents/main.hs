module Main where

import RecursiveContents

main = do
  result <- getRecursiveContents "./"
  putStrLn (show result)
