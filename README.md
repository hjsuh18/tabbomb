# tabbomb
Chrome extension that automatically closes tabs that have been opened with a certain keyboard shortcut after a set amount of time.

## Initial Proposal
You have a question, you ask Google and Google gives you a long list of blog posts, news articles, reddit, stack overflow and github threads. You click on 5 of them, planning to skim through each of them and to narrow the answer down to one page. But what you actually do is click on another 5 links on one of the pages. Pretty quickly you end up stuck in a web of pages and end up forgetting what you actually started your search for. In the end, you have to delete a bunch tabs and start your search again.  

This Chrome Extension attempts to solve this problem. It is specifically designed to tackle this situation when you are searching quickly for an answer and need to open multiple tabs at a time to scan for answers.

When you know you're only opening up a tab to scan it quickly to see if there's anything useful in it, open the tab with a *special shortcut*. This will open the tab, but set a timer on the tab so that it disappears after a set amount of time. If you don't use the tab during that time, you know you're going to clean it out later. Why not just set a program to do this automatically for you?

## Extra Features
1. When you discover that the tab is actually useful, you can enter a *shortcut* and the timer will stop and the tab will stay unless you actually close it.
2. You can set another time during which the tabs that automatically closed are stored in the extension.
3. Timer shows at the top right of browser so that it's easy to see that the tab is about to close, to avoid tabs automatically closing when you don't actually want it to. 
- this might just be avoidable by users choosing a longer time period on the timer. e.g. I know if I don't look at a stack overflow tab for an hour, I probably moved onto something else and it won't be helpful. 
4. Make it easy to distinguish between a *bomb tab* and a normal tab. 
5. Big Stretch: analyze the behaviour of users to smartly close tabs for them
6. Make context menu so that you can right click and make a tab into a TabBomb tab

## Initial Problems
1. Would like to have a mouse shortcut, but this seems harder than a keyboard shortcut

## Variations of Product
1. Have a button that closes all tabs that are older than X days/hours
