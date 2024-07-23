package com.project;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * A controller that maps URLs to their corresponding html entrypoint.
 */
@Controller
public class PageViewController {
  public PageViewController() { }

  /**
   * Displays the homepage at the root URL (e.g., http://localhost:8080/).
   */
  @RequestMapping("/")
  public String home() {
    // This maps to `src/main/frontend/home.html`
    return "home";
  }
}
