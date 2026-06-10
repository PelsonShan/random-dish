package com.randomdish.service;

import com.randomdish.mapper.TagMapper;
import com.randomdish.model.dto.TagResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagMapper tagMapper;

    public List<TagResponse> listAll() {
        return tagMapper.selectList(null).stream()
                .map(t -> TagResponse.builder()
                        .id(t.getId()).name(t.getName()).category(t.getCategory())
                        .createdAt(t.getCreatedAt()).build())
                .collect(Collectors.toList());
    }
}
