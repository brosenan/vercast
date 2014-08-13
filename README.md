# Overview
Vercast (VERsion Controlled Application STate) is an application framework that is also a version control system.  How do the two connect?  Well, Vercast is based on the notion that the state of an application, the "data" that it holds, is important.  It is not less important than its source code.  For source code we use version control, so why not use it for state?

## Version Control for Source Code
So why do we use version control for source code?  We do this mainly for two reasons.  The first is to allow users to to make any change to the code without being afraid to break things.  If they do, they can always go back to a previous version and do things right.
The second reason is to allow multiple users to make changes to the code in parallel, while keeping the code consistent.  Code changes often cross source-file boundaries.  For example, a code change may consist of adding a function definition in one file, and a use of that function in another.  These changes need to be kept consistent for the program to compile and work properly.  Version control allows such changes to move together from one developer to another, keeping the program consistent.

## The Problem with State
For many years, relational databases were the de-facto standard in maintaining application state.  If you go to the "hello world" tutorial of any decent application framework, you'll see just that.  Relational databases needed the same notion of consistency source code does, just that instead of consistency between files, relational databases require consistency between records, because one "object" (e.g., a customer invoice) may contain a few of these (e.g., one for each purchased item). To allow these records to remain consistent, relational databases started using *transactions*.  Transactions allow for database operations to have the look and fill as if they were made in sequence, although some of them were made in parallel.

As the Web grew, big applications started getting bottlenecked by transactions.  Developers of such big applications then turned to other consistency models, and the NoSQL movement was born.

### The NoSQL Movement
NoSQL is a common name for databases that came to address the problems that are common in the relational world.  The main two problems were avilablility and performance scalability, which were addressed mostly by introducing more relaxed consistency models.  The main idea is: less required consistency means less coordination needed, means less change for something to go wrong (hence more availability) and generally, less things to do (performance).  Roughly speaking, the new consistency models adopted by NoSQL databases abandoned the concept of a transaction, and consider each change as standing on its own.

The problem is, the world did not change.  The world still holds dependencies between different pieces of data.  Sometimes it is easy to capture these pieces together (e.g., consider the entire customer invoice as a single "thing"), but sometimes it is more difficult.  For these times, we are developing Vercast.
