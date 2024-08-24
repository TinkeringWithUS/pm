import pytest
import playwright

from time import sleep

from playwright.sync_api import sync_playwright
from playwright.sync_api import Page

from playwright.sync_api import expect

from playwright.sync_api import ElementHandle
from playwright.sync_api import WebSocket

from socket_events import CHAT_NEW_MESSAGE_SIGNAL

import json

BACKEND_URL = "http://localhost:5173/"

def test_chat(): 

    """
    spawn 2 instances of the chat app, log in, and first instance 
    sends a message that second instance should see 
    """
    print("test_chat")

    pass

def register(page: Page): 
    register_link = page.query_selector()

def signin(page: Page): 
    signin_link = page.query_selector('.header-item a[href*="signin"]')
    signin_link.click()

    username_input = page.query_selector('input#auth-username')
    username_input.fill("a")

    password_input = page.query_selector('input#auth-password')
    password_input.fill("a")

    submit_button = page.query_selector('button[type="submit"]') 
    submit_button.click()

    success_notif = page.wait_for_selector("#logged-in-notif")
    success_notif.wait_for_element_state("visible")



# def test_signin(page: Page):
#     page.goto("http://localhost:5173/")
    
#     signin(page)


def test_chatroom(page: Page): 
    page.goto(BACKEND_URL)

    signin(page)

    page.goto(BACKEND_URL)

    # unlike selenium, automatically waits for events to happen before 
    # further execution
    # e.g. page
    # page.goto("https://www.duckduckgo.com", wait_until="load")
    # load is default
    chat_link = page.query_selector('.header-item a[href*="chat"]')
    chat_link.click()

    def create_room(roomname: str):
        create_room_button = page.query_selector(".create-room-modal-button") 
        create_room_button.click()

        # modal should pop up
        chat_create_input = page.query_selector("#create-chat-room") 
        chat_create_input.fill(roomname)

        chat_create_submit_button = page.query_selector('button[type="submit"]')
        chat_create_submit_button.click()

        # create chat room input should be hidden after modal is done
        expect(page.locator("#create-chat-room")).to_have_count(0)

    create_room("a")
    create_room("b")

    def join_room(roomname: str): 
        join_button = page.query_selector("button.join-room-modal-button")
        join_button.click() 

        join_input = page.query_selector("input#join-chat-room") 
        join_input.fill(roomname)

        join_submit_button = page.query_selector('button[type="submit"]')
        join_submit_button.click()
        
        # join chat room input should be hidden after we're done with modal
        expect(page.locator("input#join-chat-room")).to_have_count(0)

    def grab_chat_messages(roomname) -> list[str]: 
        join_room(roomname=roomname)

        current_joined_room = page.query_selector(".current-joined-room-display")

        current_room = current_joined_room.text_content()

        assert (current_room != None and roomname in current_room)

        # TODO: wait for chat messages to arrive before querying
        # else a race condition, websockets
        # page.expect_response(BACKEND_URL + "signin")
        # WebSocket().expect_event(CHAT_NEW_MESSAGE_SIGNAL)
        # socketio uses either http long polling or websockets
        # tough to deal with socketio because it switches 
        # protocols between xhr and websockets 
        # temporary fix
        sleep(1)

        chat_messages_body = page.query_selector_all("span.message-body")

        assert chat_messages_body != None

        def container_to_text(container: ElementHandle): 
            return container.text_content()

        chat_messages = list(map(container_to_text, chat_messages_body))
        chat_messages_no_nones = list(filter(lambda message: message != None, chat_messages) )

        return chat_messages_no_nones

    # now on the /chat page
    # try to join a room 'a', and then join 'b', the chat messages
    # should be emptied
    room_a_messages = grab_chat_messages("a")
    assert len(room_a_messages) > 0

    room_b_messages = grab_chat_messages("b")
    assert len(room_a_messages) > 0

    assert room_a_messages != room_b_messages


def test_multi_user_chat(page: Page): 

    pass




# to run tests, be in the pm_project directory and run 
# python3 -m pytest .\tests\ (\ for windows, / in linux)