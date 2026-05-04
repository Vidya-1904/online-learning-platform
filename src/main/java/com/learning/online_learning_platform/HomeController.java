package com.learning.online_learning_platform;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) {
        return "home";
    }

    @GetMapping("/courses")
    public String courses(Model model) {
        return "courses";
    }

    @GetMapping("/course-detail")
    public String courseDetail(Model model) {
        return "course-detail";
    }

    @GetMapping("/my-courses")
    public String myCourses(Model model) {
        return "my-courses";
    }

    @GetMapping("/login")
    public String login(Model model) {
        return "login";
    }

    @GetMapping("/certificate")
    public String certificate(Model model) {
        return "certificate";
    }

    @GetMapping("/admin")
    public String admin(Model model) {
        return "admin";
    }
}