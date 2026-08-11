# Event-Driven Architecture

## Why Event-Driven

When application was first decided to be developed, question on how to store data arise. Storing data was important to address because it touched how it will work outside single device, in moments when error arises.

Simple CRUD architecture would be harder to maintain, while event driven would have a lot of data stored that would never be used.

Decision to follow **event-driven** architecture was mainly due to maintainability.

## Properties of Event

Event is a piece of data that has a occured.

However, even if everything could be considered an event, this application does not need all varities of data to be stored as event.

### Examples of events

- Calendar Event
- Settings

### Examples of not events

- Error log (it could be store as event in error management software, but not calendar application)

## Beyond Kei

Having event-driven system allows to do something crazier.

We can add another apps, like habit app inside Kei without developing another app to experiment! Later if we need habit app, we just develop new app.

We just add new field in event of category/source/resource and assign it with value like "calendar", "habit", "todo", etc.
