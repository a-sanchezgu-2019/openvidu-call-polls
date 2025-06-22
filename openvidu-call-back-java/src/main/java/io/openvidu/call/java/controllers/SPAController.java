package io.openvidu.call.java.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
public class SPAController {

    @GetMapping({"/**/{path:[^\\.]*}", "/{path:[^\\.]*}"}) 
    public String getMethodName(@RequestParam String param) {
        return "forward:/index.html/" + param;
    }
    

}
