package com.trustXchange.entities.gmp;

import javax.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "gmp_count")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GmpCount {
    @Id
    @Column(name = "name", nullable = false)
    String name;
    
    @Column(name = "count", nullable = false)
    Long count;
}
